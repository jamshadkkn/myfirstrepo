import React from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Img, staticFile} from 'remotion';
import {CivetHead} from '../art/civet';
import {easeIn, easeOut, LINES, pop, prog} from '../lib/anim';

export const ML = "'Anek', 'Anek Malayalam', sans-serif";

let fontsRequested = false;
export const ensureFonts = () => {
  if (fontsRequested || typeof document === 'undefined') return;
  fontsRequested = true;
  const handle = delayRender('Loading Malayalam fonts');
  const faces = [
    new FontFace('Anek', `url(${staticFile('fonts/AnekMalayalam-ExtraBold.ttf')}) format('truetype')`, {weight: '800'}),
    new FontFace('Anek', `url(${staticFile('fonts/AnekMalayalam-Bold.ttf')}) format('truetype')`, {weight: '700'}),
    new FontFace('PoppinsBlack', `url(${staticFile('fonts/Poppins-Black.ttf')}) format('truetype')`, {weight: '900'}),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((loaded) => {
      loaded.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    })
    .catch((e) => cancelRender(e));
};

/** Thick black outline for HTML text, built from shadows so the fill stays crisp. */
export const outline = (px: number, color = '#000', drop = true) => {
  const parts: string[] = [];
  for (let a = 0; a < 360; a += 22.5) {
    const r = (a * Math.PI) / 180;
    parts.push(`${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`);
  }
  if (drop) parts.push(`0 ${px + 4}px 0 rgba(0,0,0,0.55)`);
  return parts.join(', ');
};

type Phrase = {caption: string; start: number; end: number; words: {text: string; start: number; end: number}[]; lineId: string};
const PHRASES: Phrase[] = LINES.flatMap((l) => l.phrases.map((p) => ({...p, lineId: l.id})));

/** Bottom captions: the whole phrase pops in, the word being spoken turns yellow. */
export const Captions: React.FC<{t: number; hideLines?: string[]}> = ({t, hideLines = []}) => {
  const idx = PHRASES.findIndex((p, i) => {
    const next = PHRASES[i + 1];
    const endShow = Math.min(next ? next.start - 0.04 : Infinity, p.end + 0.55);
    return t >= p.start - 0.08 && t < endShow;
  });
  if (idx < 0) return null;
  const p = PHRASES[idx];
  if (hideLines.includes(p.lineId)) return null;
  const sp = pop(t, p.start - 0.08, {damping: 13, stiffness: 260, mass: 0.6});
  const len = p.caption.length;
  const size = len > 34 ? 64 : len > 24 ? 72 : len > 14 ? 80 : 92;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 1300,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignContent: 'flex-start',
          columnGap: 20,
          rowGap: 4,
          transform: `scale(${0.75 + 0.25 * sp}) translateY(${(1 - sp) * 30}px)`,
          opacity: Math.min(1, sp * 1.5),
          transformOrigin: '50% 0%',
        }}
      >
        {p.words.map((w, i) => {
          const active = t >= w.start - 0.02 && t < w.end;
          const said = t >= w.end;
          return (
            <span
              key={i}
              style={{
                fontFamily: ML,
                fontWeight: 800,
                fontSize: size,
                lineHeight: 1.32,
                color: active ? '#FFD83A' : said ? '#ffffff' : '#f4f4f4',
                textShadow: outline(7),
                transform: `scale(${active ? 1.07 : 1})`,
                display: 'inline-block',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Hook title at the top of the first shot. */
export const TopTitle: React.FC<{t: number; tIn: number; tOut: number}> = ({t, tIn, tOut}) => {
  if (t < tIn || t > tOut + 0.4) return null;
  const sIn = pop(t, tIn, {damping: 10, stiffness: 200});
  const out = prog(t, tOut, tOut + 0.3, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top: 250,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(${-out * 260}px) rotate(-2deg) scale(${0.4 + 0.6 * sIn})`,
        opacity: Math.min(1, sIn * 2) * (1 - out),
      }}
    >
      <div
        style={{
          background: '#FFD83A',
          border: '6px solid #111',
          borderRadius: 22,
          padding: '14px 34px 6px',
          boxShadow: '0 12px 0 rgba(0,0,0,0.35)',
          fontFamily: ML,
          fontWeight: 800,
          fontSize: 62,
          color: '#111',
          lineHeight: 1.25,
          textAlign: 'center',
        }}
      >
        ക്ലിഫ് ഹൗസിലെ യഥാർത്ഥ <span style={{color: '#c62828'}}>ബോസ്</span> ആര്?
      </div>
    </div>
  );
};

export const LocationTag: React.FC<{t: number; tIn: number; tOut: number}> = ({t, tIn, tOut}) => {
  if (t < tIn || t > tOut + 0.4) return null;
  const sIn = prog(t, tIn, tIn + 0.45, easeOut);
  const out = prog(t, tOut, tOut + 0.3, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top: 440,
        left: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(255,255,255,0.94)',
        borderRadius: 50,
        padding: '10px 28px 4px 18px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        transform: `translateX(${(1 - sIn) * -500 - out * 600}px)`,
      }}
    >
      <svg width={40} height={48} viewBox="0 0 40 48">
        <path d="M 20 46 C 20 46 4 28 4 17 A 16 16 0 0 1 36 17 C 36 28 20 46 20 46 Z" fill="#e53935" />
        <circle cx={20} cy={17} r={6} fill="#fff" />
      </svg>
      <span style={{fontFamily: ML, fontWeight: 800, fontSize: 40, color: '#1a1a1a'}}>തിരുവനന്തപുരം · നന്തൻകോട്</span>
    </div>
  );
};

/** Character intro card for the civets. */
export const IntroCard: React.FC<{t: number; tIn: number; tOut: number}> = ({t, tIn, tOut}) => {
  if (t < tIn || t > tOut + 0.4) return null;
  const sIn = pop(t, tIn, {damping: 14, stiffness: 160});
  const out = prog(t, tOut, tOut + 0.3, easeIn);
  return (
    <div style={{position: 'absolute', top: 300, right: 60, transform: `translateX(${(1 - sIn) * 700 + out * 800}px) rotate(-3deg)`}}>
      <div style={{background: '#111', border: '6px solid #FFD83A', borderRadius: 18, padding: '18px 34px 10px', boxShadow: '0 14px 0 rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: ML, fontWeight: 800, fontSize: 86, color: '#FFD83A', lineHeight: 1.1}}>മരപ്പട്ടി</div>
        <div style={{fontFamily: 'PoppinsBlack', fontWeight: 900, fontSize: 30, color: '#fff', letterSpacing: 2, marginTop: 2}}>ASIAN PALM CIVET</div>
        <div style={{marginTop: 12, display: 'inline-block', background: '#e53935', color: '#fff', borderRadius: 10, padding: '6px 16px 0', fontFamily: ML, fontWeight: 800, fontSize: 36}}>
          നൈറ്റ് ഷിഫ്റ്റ് സ്പെഷ്യലിസ്റ്റ്
        </div>
      </div>
    </div>
  );
};

/** Big slammed word (e.g. "അയ്യേ!"). */
export const Stamp: React.FC<{t: number; tIn: number; tOut: number; text: string; color?: string; top?: number; size?: number; rot?: number}> = ({
  t,
  tIn,
  tOut,
  text,
  color = '#a5e85a',
  top = 560,
  size = 190,
  rot = -7,
}) => {
  if (t < tIn || t > tOut + 0.3) return null;
  const k = Math.min(1, (t - tIn) / 0.12);
  const sc = t - tIn < 0.12 ? 2.4 - 1.4 * k : 1 + 0.06 * Math.exp(-(t - tIn - 0.12) * 8) * Math.sin((t - tIn) * 40);
  const out = prog(t, tOut, tOut + 0.25, easeIn);
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', transform: `rotate(${rot}deg) scale(${sc * (1 - out * 0.4)})`, opacity: 1 - out}}>
      <span style={{fontFamily: ML, fontWeight: 800, fontSize: size, color, textShadow: outline(12), lineHeight: 1.2}}>{text}</span>
    </div>
  );
};

type CalPage = {year: string; month: string};
/** Kerala-style tear-off wall calendar. `flip` = number of pages turned (fractional = mid-flip). */
export const Calendar: React.FC<{pages: CalPage[]; flip: number; x: number; y: number; s?: number; rot?: number}> = ({pages, flip, x, y, s = 1, rot = 0}) => {
  const page = (p: CalPage, z: number, angle: number, key: string) => (
    <div
      key={key}
      style={{
        position: 'absolute',
        inset: 0,
        background: '#fffdf6',
        borderRadius: 10,
        boxShadow: '0 4px 0 #e6dcc4',
        transformOrigin: '50% 0%',
        transform: `perspective(1400px) rotateX(${angle}deg)`,
        zIndex: z,
        backfaceVisibility: 'hidden',
        overflow: 'hidden',
      }}
    >
      <div style={{background: '#c62828', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span style={{fontFamily: ML, fontWeight: 800, fontSize: 64, color: '#fff', paddingTop: 12}}>{p.month}</span>
      </div>
      <div style={{textAlign: 'center', fontFamily: 'PoppinsBlack', fontWeight: 900, fontSize: 200, color: '#1b1b1b', lineHeight: 1.6}}>{p.year}</div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: -30}}>
        {Array.from({length: 7}).map((_, i) => (
          <div key={i} style={{width: 34, height: 34, borderRadius: 6, background: i === 0 ? '#ef9a9a' : '#e0d8c4'}} />
        ))}
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: x - 280, top: y, width: 560, height: 620, transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: '50% 0%'}}>
      <div style={{position: 'absolute', left: 250, top: -70, width: 60, height: 60, borderRadius: 30, border: '8px solid #6d4c41'}} />
      <div style={{position: 'absolute', inset: 0, background: '#efe6cf', borderRadius: 10, transform: 'translate(10px, 12px)'}} />
      {pages.map((p, i) => {
        const turned = Math.max(0, Math.min(1, flip - i));
        if (turned >= 1) return null;
        return page(p, pages.length - i, -turned * 120, `p${i}`);
      })}
      <div style={{position: 'absolute', left: -10, right: -10, top: -14, height: 30, background: '#5d4037', borderRadius: 8, zIndex: 50}} />
    </div>
  );
};

/** Newspaper page with the May 2026 headline; `hl` = 0..1 highlighter progress over the headline. */
export const Newspaper: React.FC<{hl: number; wink: number; t: number}> = ({hl, wink, t}) => {
  const words = ['പുതിയ', 'മുഖ്യമന്ത്രിയുടെയും', 'ഉറക്കം', 'കെടുത്താൻ', 'മരപ്പട്ടികൾ!'];
  return (
    <div style={{width: 900, height: 1180, background: '#f6f1e4', borderRadius: 6, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', padding: '40px 50px', boxSizing: 'border-box', position: 'relative'}}>
      <div style={{textAlign: 'center', fontFamily: ML, fontWeight: 800, fontSize: 92, color: '#1a1a1a', lineHeight: 1.15}}>ഇന്നത്തെ വാർത്ത</div>
      <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '5px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', padding: '10px 4px 2px', fontFamily: ML, fontWeight: 700, fontSize: 30, color: '#333'}}>
        <span>തിരുവനന്തപുരം</span>
        <span>2026 മെയ്</span>
      </div>
      <div style={{marginTop: 28, fontFamily: ML, fontWeight: 800, fontSize: 82, lineHeight: 1.32, color: '#111'}}>
        {words.map((w, i) => {
          const k = Math.max(0, Math.min(1, hl * words.length - i));
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', marginRight: 22}}>
              <span style={{position: 'absolute', left: -6, right: -6, top: '18%', height: '62%', background: '#ffe14d', transformOrigin: '0 50%', transform: `scaleX(${k})`, zIndex: 0, borderRadius: 6}} />
              <span style={{position: 'relative', zIndex: 1, color: i === words.length - 1 ? '#b71c1c' : '#111'}}>{w}</span>
            </span>
          );
        })}
      </div>
      <div style={{display: 'flex', gap: 30, marginTop: 26}}>
        <div style={{width: 380, height: 330, background: '#2b2b38', border: '8px solid #fff', boxShadow: '0 0 0 3px #999', overflow: 'hidden'}}>
          <svg viewBox="-190 -170 380 330" width={380 - 16} height={330 - 16}>
            <rect x={-190} y={-170} width={380} height={330} fill="#232436" />
            <circle cx={120} cy={-110} r={40} fill="#fff2c4" />
            <CivetHead x={0} y={20} s={1.05} night={0.15} mood="smug" wink={wink} brow={1} lookX={0.4} />
          </svg>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8}}>
          {Array.from({length: 9}).map((_, i) => (
            <div key={i} style={{height: 16, borderRadius: 8, background: '#bdb6a6', width: `${[100, 92, 97, 88, 100, 80, 95, 90, 60][i]}%`}} />
          ))}
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 34}}>
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} style={{height: 16, borderRadius: 8, background: '#cfc8b8', width: `${[100, 96, 99, 93, 97, 70][i]}%`}} />
        ))}
      </div>
    </div>
  );
};

/** Film grain + vignette + bottom shade for caption legibility. */
export const Overlays: React.FC<{frame: number}> = ({frame}) => {
  const k = Math.floor(frame / 2);
  const ox = (k * 137) % 270;
  const oy = (k * 211) % 480;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 62%, rgba(0,0,0,0.38) 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />
      <AbsoluteFill style={{overflow: 'hidden', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <Img src={staticFile('grain.png')} style={{position: 'absolute', left: -ox, top: -oy, width: 1080 + 540, height: 1920 + 960, imageRendering: 'pixelated'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SafeArea: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1920 * 0.12, background: 'rgba(255,0,0,0.25)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 1920 * 0.18, background: 'rgba(255,0,0,0.25)'}} />
    <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: 1080 * 0.06, background: 'rgba(255,0,0,0.2)'}} />
    <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: 1080 * 0.06, background: 'rgba(255,0,0,0.2)'}} />
  </AbsoluteFill>
);

