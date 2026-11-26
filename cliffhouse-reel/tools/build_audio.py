"""Scene timing, sound effects, music and the final mix.

Reads public/timeline.json (from tts.py) and writes:
  public/events.json  scene boundaries + key moments (the video reads these too, so picture and sound agree)
  public/mix.wav      narration + ducked music + sound effects, stereo 48 kHz
  public/grain.png    film-grain texture for the overlay
Everything is synthesized here; no samples are downloaded.
"""
import json
import os
import wave

import numpy as np
from PIL import Image
from scipy.signal import butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PUB = os.path.join(ROOT, "public")
SR = 48000
RNG = np.random.default_rng(7)


# ---------------------------------------------------------------- events
def build_events(tl):
    L = {l["id"]: l for l in tl["lines"]}

    def ps(i, j):
        return L[i]["phrases"][j]["start"]

    def pe(i, j):
        return L[i]["phrases"][j]["end"]

    total = tl["total"]
    b = {}
    b["teaser"] = 0.0
    b["establish"] = L["L1"]["start"] - 0.25
    b["boss"] = L["L3"]["start"] - 0.35
    b["reveal"] = L["L4"]["start"] - 0.3
    b["night"] = L["L5"]["start"] - 0.25
    b["y2024"] = L["L6"]["start"] - 0.25
    b["glass"] = L["L7"]["start"] - 0.2
    b["y2026"] = L["L9"]["start"] - 0.3
    b["paper"] = L["L10"]["start"] - 0.25
    b["montage"] = L["L12"]["start"] - 0.25
    b["finale"] = L["L13"]["start"] - 0.2
    b["end"] = L["L13"]["end"] + 0.35
    order = list(b.keys())
    scenes = []
    for k, name in enumerate(order):
        s = b[name]
        e = b[order[k + 1]] if k + 1 < len(order) else total
        scenes.append({"name": name, "start": round(s, 3), "end": round(e, 3)})

    night_thumps = list(np.arange(b["night"] + 0.35, b["y2024"] - 0.25, 0.42))
    ev = {
        "teaserBlink": 0.45,
        "titleIn": b["establish"] + 0.25,
        "locIn": L["L1"]["start"],
        "houseName": ps("L1", 1),
        "salute": L["L2"]["start"] + 0.1,
        "crownIn": pe("L3", 0) - 0.5,
        "crownDrop": ps("L3", 1) + 0.15,
        "eyesBlink": ps("L4", 0),
        "civetPop": ps("L4", 1),
        "cardIn": ps("L4", 1) + 0.35,
        "thumps": [round(x, 3) for x in night_thumps],
        "cal2024": b["y2024"] + 0.1,
        "podiumIn": ps("L6", 1) - 0.1,
        "peek": ps("L7", 1) - 0.15,
        "dropForm": pe("L7", 1) - 0.1,
        "dropHit": L["L7"]["end"] + 0.5,
        "ayye": L["L8"]["start"],
        "calFlips": [b["y2026"] + 0.05, b["y2026"] + 0.22, b["y2026"] + 0.39],
        "house2026": ps("L9", 1) - 0.25,
        "munch": [ps("L9", 1) + 0.55, ps("L9", 1) + 1.25],
        "paperLand": L["L10"]["start"] + 1.25,
        "headlineCivet": ps("L11", 1),
        "montageCars": [round(b["montage"] + 0.2 + k * 0.5, 3) for k in range(4)],
        "banner": ps("L13", 1),
        "endText": b["end"] + 0.25,
    }
    ev = {k: (round(v, 3) if isinstance(v, float) else v) for k, v in ev.items()}
    return {"fps": tl["fps"], "total": total, "durationInFrames": tl["durationInFrames"], "scenes": scenes, "t": ev}


# ---------------------------------------------------------------- dsp helpers
def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(n):
    return RNG.uniform(-1, 1, n)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def sweep_lp(x, f0, f1):
    """One-pole low-pass whose cutoff glides from f0 to f1 (log)."""
    n = len(x)
    fc = f0 * (f1 / f0) ** (np.arange(n) / max(1, n - 1))
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty(n)
    s = 0.0
    for i in range(n):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def glide_sine(f0, f1, d, curve="exp"):
    t = tt(d)
    if curve == "exp":
        f = f0 * (f1 / f0) ** (t / d)
    else:
        f = f0 + (f1 - f0) * (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def pluck(freq, d, bright=1.0, tau=0.6, harmonics=10):
    """Additive plucked string: exact pitch, higher partials die faster."""
    t = tt(d)
    y = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        if freq * k > 12000:
            break
        amp = (1.0 / k ** 1.3) * (bright ** (k - 1))
        y += amp * np.sin(2 * np.pi * freq * k * t + k * 0.7) * np.exp(-t / (tau / (1 + 0.55 * (k - 1))))
    att = np.minimum(1, t / 0.004)
    y *= att
    y += 0.08 * hp(noise(len(t)), 2500) * np.exp(-t / 0.012)
    return y / (np.abs(y).max() + 1e-9)


def bell(freq, d, tau=0.5):
    t = tt(d)
    y = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / (tau * 0.4)) + 0.15 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t / (tau * 0.2))
    return y * np.exp(-t / tau) * np.minimum(1, t / 0.002)


def place(y, sig, i):
    """Add sig into y starting at sample i, clipped to y's length."""
    j = min(len(y), i + len(sig))
    if j > i:
        y[i:j] += sig[: j - i]


def fade(y, a=0.005, r=0.02):
    n = len(y)
    na, nr = int(a * SR), int(r * SR)
    if na:
        y[:na] *= np.linspace(0, 1, na)
    if nr:
        y[-nr:] *= np.linspace(1, 0, nr)
    return y


def norm(y, peak=0.9):
    return y * (peak / (np.abs(y).max() + 1e-9))


def note(name):
    names = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    p, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[p] + 12 * (o + 1) - 69) / 12)


# ---------------------------------------------------------------- sound effects (mono)
def sfx_whoosh(d=0.45):
    t = tt(d)
    y = sweep_lp(noise(len(t)), 500, 5000)
    y = hp(y, 200) * np.sin(np.pi * t / d) ** 1.5
    return fade(norm(y, 0.8))


def sfx_pop():
    y = glide_sine(320, 980, 0.09) * np.exp(-tt(0.09) / 0.035)
    y[:200] += np.linspace(0.6, 0, 200)
    return fade(norm(y, 0.8), 0.001, 0.01)


def sfx_boing(d=0.6):
    t = tt(d)
    f = 420 * (170 / 420) ** (t / d) * (1 + 0.12 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.25))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.exp(-t / 0.28)
    return fade(norm(y, 0.8), 0.002, 0.05)


def sfx_slide_down(d=0.7):
    t = tt(d)
    f = 1300 * (260 / 1300) ** (t / d) * (1 + 0.015 * np.sin(2 * np.pi * 7 * t))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.03) * np.exp(-t / 0.9)
    y += 0.05 * bp(noise(len(t)), 1000, 4000) * np.exp(-t / 0.3)
    return fade(norm(y, 0.6), 0.01, 0.08)


def sfx_scratch():
    d = 0.32
    t = tt(d)
    n = noise(len(t))
    fc = 900 + 700 * np.sin(2 * np.pi * 6.5 * t)
    y = np.zeros_like(t)
    seg = int(0.02 * SR)
    for i in range(0, len(t), seg):
        c = fc[i]
        y[i:i + seg] = bp(n[i:i + seg], c * 0.6, c * 1.6)
    y *= np.abs(np.sin(2 * np.pi * 6.5 * t)) ** 0.5 * np.exp(-t / 0.4)
    return fade(norm(y, 0.7))


def sfx_thud():
    d = 0.3
    t = tt(d)
    y = glide_sine(95, 45, d) * np.exp(-t / 0.09) + 0.4 * glide_sine(190, 120, d) * np.exp(-t / 0.05)
    y += 0.3 * lp(noise(len(t)), 900) * np.exp(-t / 0.02)
    return fade(norm(y, 0.95), 0.001, 0.05)


def sfx_scurry():
    d = 0.55
    y = np.zeros(int(d * SR))
    times = np.sort(RNG.uniform(0, d - 0.02, 14))
    for k, s in enumerate(times):
        i = int(s * SR)
        c = bp(noise(int(0.006 * SR)), 1800, 6000) * np.exp(-np.arange(int(0.006 * SR)) / (0.0015 * SR))
        place(y, c * (0.5 + 0.5 * (k % 2)), i)
    return fade(norm(y, 0.6))


def sfx_flip():
    d = 0.22
    t = tt(d)
    y = hp(noise(len(t)), 1800) * (np.exp(-((t - 0.04) / 0.02) ** 2) + 0.7 * np.exp(-((t - 0.12) / 0.03) ** 2))
    return fade(norm(y, 0.6))


def sfx_creak():
    d = 0.6
    t = tt(d)
    f = 110 + 40 * np.sin(2 * np.pi * 1.3 * t) + 10 * RNG.standard_normal(len(t)).cumsum() / 400
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    y = bp(saw, 500, 2200) * np.sin(np.pi * t / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
    return fade(norm(y, 0.5))


def sfx_plop():
    y1 = glide_sine(1700, 520, 0.05) * np.exp(-tt(0.05) / 0.02)
    y2 = glide_sine(780, 330, 0.18) * np.exp(-tt(0.18) / 0.06)
    y = np.zeros(int(0.25 * SR))
    y[: len(y1)] += 0.6 * y1
    place(y, y2, int(0.01 * SR))
    return fade(norm(y, 0.9), 0.001, 0.03)


def sfx_stamp():
    y = sfx_thud()
    c = hp(noise(int(0.06 * SR)), 2000) * np.exp(-np.arange(int(0.06 * SR)) / (0.015 * SR))
    y[: len(c)] += 0.4 * c
    return norm(y, 0.9)


def sfx_sparkle():
    y = np.zeros(int(1.0 * SR))
    for k, n_ in enumerate(["C6", "D6", "E6", "G6", "A6", "C7"]):
        b_ = bell(note(n_), 0.6, 0.35)
        i = int(k * 0.05 * SR)
        place(y, b_ * (0.8 - 0.08 * k), i)
    return fade(norm(y, 0.5))


def sfx_tada():
    y = np.zeros(int(1.6 * SR))
    for k, n_ in enumerate(["C4", "E4", "G4", "C5"]):
        p = pluck(note(n_), 1.5, 0.8, 0.9)
        i = int(k * 0.045 * SR)
        place(y, p * 0.7, i)
    for n_ in ["C5", "E5", "G5"]:
        place(y, 0.25 * bell(note(n_), 1.2, 0.6), int(0.2 * SR))
    return fade(norm(y, 0.8))


def sfx_car():
    d = 0.6
    t = tt(d)
    f = 260 * (150 / 260) ** (t / d)
    ph = np.cumsum(f) / SR
    y = lp(2 * (ph % 1) - 1, 1200) * 0.5 + 0.5 * bp(noise(len(t)), 300, 2500)
    y *= np.exp(-((t - d / 2) / (d / 3.2)) ** 2)
    return fade(norm(y, 0.5))


def sfx_munch():
    y = np.zeros(int(0.42 * SR))
    for k in range(3):
        c = hp(noise(int(0.07 * SR)), 1500) * np.exp(-np.arange(int(0.07 * SR)) / (0.012 * SR))
        i = int(k * 0.13 * SR)
        place(y, c, i)
    return fade(norm(y, 0.5))


def sfx_hmm():
    d = 1.0
    t = tt(d)
    y = (np.sin(2 * np.pi * 98 * t) + 0.5 * np.sin(2 * np.pi * 147 * t + 0.3) + 0.2 * np.sin(2 * np.pi * 196 * t)) * np.sin(np.pi * t / d) ** 2
    return fade(norm(y, 0.5))


def sfx_blink():
    y = glide_sine(2200, 2600, 0.05) * np.exp(-tt(0.05) / 0.015)
    return fade(norm(y, 0.35), 0.001, 0.01)


def sfx_end_sting():
    y = np.zeros(int(2.8 * SR))
    for k, n_ in enumerate(["G3", "C4", "E4", "G4", "C5"]):
        p = pluck(note(n_), 2.5, 0.75, 1.4)
        i = int(k * 0.06 * SR)
        place(y, p * 0.6, i)
    cym = hp(noise(int(2.0 * SR)), 5000) * np.exp(-np.arange(int(2.0 * SR)) / (0.5 * SR))
    place(y, 0.12 * cym, int(0.3 * SR))
    return fade(norm(y, 0.85), 0.002, 0.4)


# ---------------------------------------------------------------- music
BPM = 112
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = [("C3", ["C4", "E4", "G4"]), ("A2", ["A3", "C4", "E4"]), ("F2", ["F3", "A3", "C4"]), ("G2", ["G3", "B3", "D4"])]
MELODY = [
    [("G4", 0, 1), ("E4", 1, .5), ("G4", 1.5, .5), ("A4", 2, .5), ("G4", 2.5, .5), ("E4", 3, 1)],
    [("A4", 0, 1), ("C5", 1, .5), ("A4", 1.5, .5), ("G4", 2, .5), ("E4", 2.5, 1.5)],
    [("F4", 0, 1), ("A4", 1, .5), ("C5", 1.5, .5), ("D5", 2, .5), ("C5", 2.5, .5), ("A4", 3, 1)],
    [("B4", 0, 1), ("D5", 1, .5), ("B4", 1.5, .5), ("G4", 2, 1), ("D4", 3, .5), ("F4", 3.5, .5)],
]


def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[1] or i + len(sig) <= 0:
        return
    j = min(buf.shape[1], i + len(sig))
    s = sig[: j - i] * gain
    lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += s * lg * 1.414
    buf[1, i:j] += s * rg * 1.414


def music_loop(total):
    m = np.zeros((2, int(total * SR) + SR))
    cache = {}

    def P(n, d, bright, tau):
        k = (n, d, bright, tau)
        if k not in cache:
            cache[k] = pluck(note(n), d, bright, tau)
        return cache[k]

    nbars = int(np.ceil(total / BAR)) + 1
    for bar in range(nbars):
        t0 = bar * BAR
        bass, chord = CHORDS[bar % 4]
        add(m, P(bass, 0.9, 0.5, 0.35), t0, 0.55, 0.0)
        add(m, P(bass, 0.9, 0.5, 0.35), t0 + 2 * BEAT, 0.45, 0.0)
        for beat in (1, 3):
            for k, n_ in enumerate(chord):
                add(m, P(n_, 0.5, 0.65, 0.22), t0 + beat * BEAT + k * 0.012, 0.22, -0.35 + 0.35 * k)
        for e in range(8):
            sh = hp(noise(int(0.05 * SR)), 6000) * np.exp(-np.arange(int(0.05 * SR)) / (0.01 * SR))
            add(m, sh, t0 + e * BEAT / 2, 0.05 if e % 2 else 0.03, 0.4)
        if bar % 8 >= 4 or bar >= 4:
            for n_, at, dur in MELODY[bar % 4]:
                add(m, P(n_, max(0.4, dur * BEAT + 0.2), 0.8, 0.3), t0 + at * BEAT, 0.3, 0.2)
        wb = np.sin(2 * np.pi * 900 * tt(0.06)) * np.exp(-tt(0.06) / 0.012)
        add(m, wb, t0 + 3.5 * BEAT, 0.08, -0.5)
    return m[:, : int(total * SR)]


def drone(d, f=98.0):
    t = tt(d)
    y = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) + 0.25 * np.sin(2 * np.pi * f * 2.01 * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * t))
    y += 0.15 * lp(noise(len(t)), 400)
    return fade(norm(y, 0.35), 0.3, 0.2)


def tremolo(d):
    t = tt(d)
    y = np.zeros_like(t)
    for f in [note("A2"), note("C3"), note("E3"), note("A3")]:
        ph = f * t
        y += lp(2 * (ph % 1) - 1, 1800)
    y *= (0.55 + 0.45 * np.sin(2 * np.pi * 11 * t)) * np.minimum(1, (t / d) * 1.4 + 0.2)
    return fade(norm(y, 0.35), 0.2, 0.05)


def envelope(total, segs):
    """segs: list of (start, end) where the main loop plays; 60 ms fades."""
    n = int(total * SR)
    g = np.zeros(n)
    f = int(0.06 * SR)
    for s, e in segs:
        a, b = int(s * SR), min(n, int(e * SR))
        g[a:b] = 1
        g[a:min(b, a + f)] *= np.linspace(0, 1, min(b, a + f) - a)
        g[max(a, b - f):b] *= np.linspace(1, 0, b - max(a, b - f))
    return g


# ---------------------------------------------------------------- mix
def main():
    tl = json.load(open(os.path.join(PUB, "timeline.json"), encoding="utf-8"))
    E = build_events(tl)
    json.dump(E, open(os.path.join(PUB, "events.json"), "w", encoding="utf-8"), indent=1)
    sc = {s["name"]: s for s in E["scenes"]}
    t = E["t"]
    total = E["total"]
    n = int(total * SR)

    with wave.open(os.path.join(PUB, "vo.wav"), "rb") as r:
        vo = np.frombuffer(r.readframes(r.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    vo = np.pad(vo, (0, max(0, n - len(vo))))[:n]

    # music: loop where the story is light, cut for the two punch moments
    loop = music_loop(total)
    segs = [
        (sc["establish"]["start"], t["crownDrop"]),
        (t["civetPop"], sc["glass"]["start"] + 0.3),
        (sc["y2026"]["start"], sc["end"]["start"]),
    ]
    g = envelope(total, segs)
    # duck under the voice
    win = int(0.05 * SR)
    rms = np.sqrt(np.convolve(vo ** 2, np.ones(win) / win, mode="same"))
    act = np.clip(rms / 0.05, 0, 1)
    smooth = np.empty_like(act)
    s = 0.0
    att, rel = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.3 * SR))
    for i in range(len(act)):
        c = att if act[i] > s else rel
        s = c * s + (1 - c) * act[i]
        smooth[i] = s
    duck = 1 - 0.65 * smooth
    music = loop * (g * duck)[None, :] * 0.45

    mix = np.zeros((2, n + SR * 3))
    mix[:, :n] += music
    # narration, centered
    mix[0, :n] += vo
    mix[1, :n] += vo

    # beds for the cut sections
    add(mix, drone(t["civetPop"] - t["crownDrop"] + 0.2), t["crownDrop"] + 0.05, 0.5)
    add(mix, tremolo(t["dropHit"] - sc["glass"]["start"] - 0.25), sc["glass"]["start"] + 0.2, 0.32)
    add(mix, sfx_hmm(), 0.05, 0.45)

    cues = [
        (sfx_blink(), t["teaserBlink"], 0.5, 0),
        (sfx_whoosh(0.5), sc["establish"]["start"] - 0.2, 0.55, 0),
        (sfx_pop(), t["titleIn"], 0.45, 0),
        (sfx_pop(), t["locIn"], 0.35, -0.2),
        (sfx_sparkle(), t["salute"], 0.3, 0.3),
        (sfx_whoosh(0.4), sc["boss"]["start"] - 0.15, 0.4, 0),
        (sfx_sparkle(), t["crownIn"], 0.35, 0),
        (sfx_scratch(), t["crownDrop"] - 0.05, 0.5, 0),
        (sfx_slide_down(), t["crownDrop"] + 0.05, 0.35, 0),
        (sfx_blink(), t["eyesBlink"] + 0.1, 0.6, -0.2),
        (sfx_blink(), t["eyesBlink"] + 0.45, 0.6, 0.2),
        (sfx_tada(), t["civetPop"], 0.5, 0),
        (sfx_pop(), t["civetPop"] + 0.08, 0.4, -0.4),
        (sfx_pop(), t["civetPop"] + 0.2, 0.4, 0.4),
        (sfx_whoosh(0.35), t["cardIn"], 0.3, 0.3),
        (sfx_whoosh(0.4), sc["night"]["start"] - 0.15, 0.4, 0),
        (sfx_flip(), t["cal2024"], 0.6, 0),
        (sfx_pop(), t["podiumIn"], 0.3, 0),
        (sfx_creak(), t["peek"], 0.55, -0.3),
        (sfx_plop(), t["dropHit"], 0.9, 0),
        (sfx_stamp(), t["ayye"] - 0.02, 0.55, 0),
        (sfx_boing(), t["ayye"] + 0.1, 0.25, 0),
        (sfx_whoosh(0.4), sc["y2026"]["start"] - 0.15, 0.45, 0),
        (sfx_whoosh(0.35), t["house2026"], 0.35, 0),
        (sfx_sparkle(), t["house2026"] + 0.2, 0.3, 0),
        (sfx_whoosh(0.7), sc["paper"]["start"], 0.45, 0),
        (sfx_stamp(), t["paperLand"], 0.5, 0),
        (sfx_pop(), t["headlineCivet"], 0.35, 0),
        (sfx_whoosh(0.4), sc["montage"]["start"] - 0.1, 0.4, 0),
        (sfx_whoosh(0.4), sc["finale"]["start"] - 0.1, 0.35, 0),
        (sfx_tada(), t["banner"], 0.5, 0),
        (sfx_sparkle(), t["banner"] + 0.15, 0.3, 0),
        (sfx_end_sting(), sc["end"]["start"] + 0.05, 0.55, 0),
        (sfx_pop(), t["endText"], 0.35, 0),
        (sfx_pop(), t["endText"] + 0.45, 0.35, 0),
    ]
    for k, th in enumerate(t["thumps"]):
        cues.append((sfx_thud(), th, 0.55, -0.3 if k % 2 else 0.3))
        if k % 2 == 0:
            cues.append((sfx_scurry(), th + 0.1, 0.35, 0.5 if k % 4 == 0 else -0.5))
    for k, tf in enumerate(t["calFlips"]):
        cues.append((sfx_flip(), tf, 0.55, 0))
    for tm in t["munch"]:
        cues.append((sfx_munch(), tm, 0.3, 0.4))
    for k, tc in enumerate(t["montageCars"]):
        cues.append((sfx_car(), tc, 0.25, -0.6 if k % 2 else 0.6))
    for sig, at, gain, pan in cues:
        add(mix, sig, at, gain, pan)

    mix = mix[:, :n]
    # loudness: aim ~-16 dBFS RMS, soft-limit peaks under -1 dBFS
    rms = np.sqrt((mix ** 2).mean())
    mix *= 10 ** (-16 / 20) / (rms + 1e-9)
    mix = np.tanh(mix * 1.1) * 0.89
    with wave.open(os.path.join(PUB, "mix.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype(np.int16).tobytes())

    # film grain tile
    g = (RNG.normal(0.5, 0.18, (480, 270)) * 255).clip(0, 255).astype(np.uint8)
    Image.fromarray(g, "L").save(os.path.join(PUB, "grain.png"))

    for s_ in E["scenes"]:
        print(f'{s_["name"]:<10} {s_["start"]:6.2f} -> {s_["end"]:6.2f}')
    pk = np.abs(mix).max()
    print(f"mix {total:.2f}s peak {20*np.log10(pk):.1f} dBFS rms {20*np.log10(np.sqrt((mix**2).mean())):.1f} dBFS")


if __name__ == "__main__":
    main()
