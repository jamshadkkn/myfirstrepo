"""Synthesize the Malayalam narration phrase by phrase with Piper and build the timeline.

Usage: python3 tools/tts.py <voices_dir>
  <voices_dir> holds vits-piper-ml_IN-<voice>-medium/ (model .onnx + .onnx.json).

Writes:
  public/vo.wav          full narration track (mono, 48 kHz)
  public/timeline.json   line/phrase/word timings used by the video and the mixer
"""
import io
import json
import os
import sys
import wave

import numpy as np
from piper import PiperVoice, SynthesisConfig
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR = 48000
FPS = 30


def synth(voice, text, length_scale):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(text, w, syn_config=SynthesisConfig(length_scale=length_scale, noise_scale=0.6, noise_w_scale=0.85))
    buf.seek(0)
    with wave.open(buf, "rb") as r:
        sr = r.getframerate()
        x = np.frombuffer(r.readframes(r.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    x = resample_poly(x, SR, sr) if sr != SR else x
    return x


def trim(x, thresh_db=-42.0, pad=0.03):
    """Cut leading/trailing silence, keep a short pad."""
    win = int(0.01 * SR)
    n = len(x) // win
    if n == 0:
        return x
    frames = x[: n * win].reshape(n, win)
    db = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-9)
    voiced = np.where(db > thresh_db)[0]
    if len(voiced) == 0:
        return x
    a = max(0, voiced[0] * win - int(pad * SR))
    b = min(len(x), (voiced[-1] + 1) * win + int(pad * SR))
    y = x[a:b].copy()
    fade = int(0.008 * SR)
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade:] *= np.linspace(1, 0, fade)
    return y


def normalize(x, target_rms_db=-19.0):
    rms = np.sqrt((x ** 2).mean()) + 1e-9
    g = 10 ** (target_rms_db / 20) / rms
    y = x * g
    peak = np.abs(y).max()
    if peak > 0.95:
        y *= 0.95 / peak
    return y


def word_times(caption, start, end):
    """Spread the caption's words over [start, end] by length (a stand-in for forced alignment)."""
    words = caption.split()
    weights = np.array([len(w) + 2 for w in words], dtype=float)
    edges = start + (end - start) * np.concatenate([[0], np.cumsum(weights) / weights.sum()])
    return [{"text": w, "start": round(float(edges[i]), 3), "end": round(float(edges[i + 1]), 3)} for i, w in enumerate(words)]


def main():
    voices_dir = sys.argv[1]
    script = json.load(open(os.path.join(HERE, "script.json"), encoding="utf-8"))
    loaded = {}

    def get_voice(name):
        if name not in loaded:
            d = os.path.join(voices_dir, f"vits-piper-ml_IN-{name}-medium")
            loaded[name] = PiperVoice.load(os.path.join(d, f"ml_IN-{name}-medium.onnx"), config_path=os.path.join(d, f"ml_IN-{name}-medium.onnx.json"))
        return loaded[name]

    pieces = []
    t = script["lead_in"]
    pieces.append(np.zeros(int(t * SR), dtype=np.float32))
    lines_out = []
    for line in script["lines"]:
        voice = get_voice(line.get("voice", script["voice"]))
        ls = line.get("length_scale", script["length_scale"])
        line_start = t
        phrases_out = []
        for i, (speech, caption) in enumerate(line["phrases"]):
            audio = normalize(trim(synth(voice, speech, ls)))
            p_start = t
            pieces.append(audio.astype(np.float32))
            t += len(audio) / SR
            phrases_out.append({"caption": caption, "start": round(p_start, 3), "end": round(t, 3), "words": word_times(caption, p_start, t)})
            if i < len(line["phrases"]) - 1:
                g = line["gaps"][i]
                pieces.append(np.zeros(int(g * SR), dtype=np.float32))
                t += g
        lines_out.append({"id": line["id"], "scene": line["scene"], "start": round(line_start, 3), "end": round(t, 3), "phrases": phrases_out})
        pieces.append(np.zeros(int(line["after"] * SR), dtype=np.float32))
        t += line["after"]
    pieces.append(np.zeros(int(script["tail"] * SR), dtype=np.float32))
    t += script["tail"]

    vo = np.concatenate(pieces)
    os.makedirs(os.path.join(ROOT, "public"), exist_ok=True)
    with wave.open(os.path.join(ROOT, "public", "vo.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(vo, -1, 1) * 32767).astype(np.int16).tobytes())

    total = len(vo) / SR
    timeline = {"fps": FPS, "durationInFrames": int(np.ceil(total * FPS)), "total": round(total, 3), "lines": lines_out}
    json.dump(timeline, open(os.path.join(ROOT, "public", "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for l in lines_out:
        print(f'{l["id"]:>4} {l["scene"]:<10} {l["start"]:6.2f} -> {l["end"]:6.2f}  ({l["end"] - l["start"]:.2f}s)')
    print(f"total {total:.2f}s  frames {timeline['durationInFrames']}")


if __name__ == "__main__":
    main()
