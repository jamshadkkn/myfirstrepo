# ക്ലിഫ് ഹൗസിലെ മരപ്പട്ടികൾ: 2D cartoon reel

A 52-second vertical (1080×1920) Malayalam cartoon reel about the palm civets of Cliff House. Everything is drawn in code with Remotion: the characters, the house and the animation. The narration, music and sound effects are also made locally.

Finished video: `out/cliffhouse-reel.mp4`

## How it is built

1. `tools/script.json`: the narration, phrase by phrase. Each entry has the spoken text, the caption text and the pauses.
2. `tools/tts.py <voices_dir>`: speaks the script with the free Piper Malayalam voice `ml_IN-arjun-medium`. It writes `public/vo.wav` and `public/timeline.json`, which hold the timing of every phrase and word.
3. `tools/build_audio.py`: works out the scene times and story beats (`public/events.json`). It also synthesizes the music and sound effects and mixes everything into `public/mix.wav`.
4. `src/`: the Remotion video. It reads `timeline.json` and `events.json`, so the picture, captions and sound stay in sync even after the script changes.

```bash
npm install
# voice model (once): https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ml_IN-arjun-medium.tar.bz2
pip install piper-tts scipy soundfile pillow
python3 tools/tts.py /path/to/voices      # folder containing vits-piper-ml_IN-arjun-medium/
python3 tools/build_audio.py
npx remotion studio                        # preview
npx remotion render CliffHouseReel out/cliffhouse-reel.mp4 --props='{"showSafeArea":false,"handle":"@yourpage"}'
```

To use a different voice, replace `public/vo.wav` with your own recording. Keep the phrase timings, or re-time them in `timeline.json`, then run `build_audio.py` again.

## Sources

- Feb 2024: the then-CM's remark that a glass of water in the Cliff House bedroom must be kept covered because of civet urine (Kerala Kaumudi).
- May 2026: the headline "പുതിയ മുഖ്യമന്ത്രിയുടെയും ഉറക്കംകെടുത്താൻ മരപ്പട്ടികൾ!" (Manorama Online).

Fonts: Anek Malayalam and Poppins, both under the SIL Open Font License.
