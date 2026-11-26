import React from 'react';
import {mixc} from '../lib/anim';

// Asian palm civet (മരപ്പട്ടി): grizzled grey-brown fur, black "bandit" mask,
// white brow and cheek patches, dark legs and a long dark tail.
const palette = (night: number) => ({
  fur: mixc('#93867a', '#4c4a5e', night),
  furHi: mixc('#aea295', '#5d5b72', night),
  dark: mixc('#3a302c', '#1d1a24', night),
  mask: '#231c1a',
  white: mixc('#f3eee5', '#b9b8c8', night),
  muzzle: mixc('#b7aa9b', '#66647a', night),
  spot: mixc('#5e5148', '#2f2c3a', night),
  inner: mixc('#a58579', '#4a3f4a', night),
});

export type Mood = 'grin' | 'smug' | 'surprised' | 'neutral' | 'munch';

/** Front-facing head. Centered on (x, y); about 190px wide at s=1. */
export const CivetHead: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  rot?: number;
  night?: number;
  blink?: number;
  wink?: number;
  lookX?: number;
  lookY?: number;
  mood?: Mood;
  chew?: number;
  brow?: number;
}> = ({x = 0, y = 0, s = 1, rot = 0, night = 0, blink = 0, wink = 0, lookX = 0, lookY = 0, mood = 'grin', chew = 0, brow = 0}) => {
  const c = palette(night);
  const eye = (cx: number, closed: number, side: number) => (
    <g transform={`translate(${cx} -28)`}>
      <g transform={`scale(1 ${Math.max(0.06, 1 - closed)})`}>
        <ellipse cx={0} cy={0} rx={18} ry={mood === 'surprised' ? 22 : 19} fill="#fbfaf6" />
        <circle cx={lookX * 7} cy={lookY * 7} r={mood === 'surprised' ? 8 : 10.5} fill="#16100e" />
        <circle cx={lookX * 7 - 4} cy={lookY * 7 - 5} r={4} fill="#fff" />
      </g>
      {closed > 0.85 && <path d="M -16 2 Q 0 10 16 2" stroke="#16100e" strokeWidth={4} fill="none" strokeLinecap="round" />}
      <path
        d={`M ${-20} ${-28 - brow * 6 * side} Q 0 ${-36 - brow * 4} 20 ${-28 + brow * 6 * side}`}
        stroke={c.white}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
  const mouth = () => {
    if (mood === 'surprised') return <ellipse cx={0} cy={80} rx={10} ry={12} fill="#3b1414" />;
    if (mood === 'munch')
      return (
        <g>
          <path d={`M -18 ${74 + chew * 4} Q 0 ${86 - chew * 6} 18 ${74 + chew * 4}`} stroke="#16100e" strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={-40} cy={50} rx={14 + chew * 4} ry={10 + chew * 3} fill={c.muzzle} opacity={0.6} />
          <ellipse cx={40} cy={50} rx={14 + (1 - chew) * 4} ry={10 + (1 - chew) * 3} fill={c.muzzle} opacity={0.6} />
        </g>
      );
    if (mood === 'neutral') return <path d="M -14 76 Q 0 82 14 76" stroke="#16100e" strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (mood === 'smug')
      return (
        <g>
          <path d="M -24 72 Q 4 86 30 64" stroke="#16100e" strokeWidth={5.5} fill="none" strokeLinecap="round" />
          <path d="M 8 77 L 15 76 L 12 86 Z" fill="#fff" />
        </g>
      );
    return (
      <g>
        <path d="M -30 66 Q 0 104 30 66 Q 0 84 -30 66 Z" fill="#3b1414" />
        <path d="M -30 66 Q 0 104 30 66" stroke="#16100e" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M -12 74 L -5 74 L -8 83 Z" fill="#fff" />
        <path d="M 6 74 L 13 74 L 10 83 Z" fill="#fff" />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={-66} cy={-74} rx={25} ry={29} fill={c.dark} transform="rotate(-18 -66 -74)" />
      <ellipse cx={66} cy={-74} rx={25} ry={29} fill={c.dark} transform="rotate(18 66 -74)" />
      <ellipse cx={-64} cy={-70} rx={12} ry={16} fill={c.inner} transform="rotate(-18 -64 -70)" />
      <ellipse cx={64} cy={-70} rx={12} ry={16} fill={c.inner} transform="rotate(18 64 -70)" />
      <path d="M -88 -32 C -94 -96 -40 -110 0 -110 C 40 -110 94 -96 88 -32 C 82 12 48 46 18 72 C 8 80 -8 80 -18 72 C -48 46 -82 12 -88 -32 Z" fill={c.fur} />
      <path d="M -60 -92 C -30 -108 30 -108 60 -92 C 30 -98 -30 -98 -60 -92 Z" fill={c.furHi} />
      <path d="M -12 -108 C -9 -76 -7 -56 0 -44 C 7 -56 9 -76 12 -108 Z" fill={c.dark} opacity={0.55} />
      <path
        d="M -84 -38 C -72 -62 -32 -62 -11 -40 C -5 -32 5 -32 11 -40 C 32 -62 72 -62 84 -38 C 82 -4 58 14 32 8 C 17 4 8 0 0 4 C -8 0 -17 4 -32 8 C -58 14 -82 -4 -84 -38 Z"
        fill={c.mask}
      />
      <ellipse cx={-52} cy={8} rx={22} ry={12} fill={c.white} />
      <ellipse cx={52} cy={8} rx={22} ry={12} fill={c.white} />
      <path d="M -23 8 C -21 -8 21 -8 23 8 C 25 40 13 66 0 68 C -13 66 -25 40 -23 8 Z" fill={c.muzzle} />
      {eye(-38, Math.max(blink, 0), 1)}
      {eye(38, Math.max(blink, wink), -1)}
      <ellipse cx={0} cy={58} rx={15} ry={10} fill="#1b1514" />
      <ellipse cx={-5} cy={54} rx={5} ry={3} fill="#fff" opacity={0.55} />
      {mouth()}
      {[-1, 1].map((d) => (
        <g key={d} stroke={c.white} strokeWidth={2.5} opacity={0.75} strokeLinecap="round">
          <line x1={22 * d} y1={60} x2={78 * d} y2={50} />
          <line x1={22 * d} y1={66} x2={80 * d} y2={68} />
        </g>
      ))}
    </g>
  );
};

/** Just a pair of glowing eyes in the dark (teaser / vent). */
export const GlowEyes: React.FC<{x: number; y: number; s?: number; blink?: number; o?: number; gap?: number}> = ({x, y, s = 1, blink = 0, o = 1, gap = 34}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <defs>
      <radialGradient id="ge-glow">
        <stop offset="0" stopColor="#eaff8a" stopOpacity="0.9" />
        <stop offset="0.45" stopColor="#c6ff4d" stopOpacity="0.28" />
        <stop offset="1" stopColor="#c6ff4d" stopOpacity="0" />
      </radialGradient>
    </defs>
    {[-gap, gap].map((cx) => (
      <g key={cx} transform={`translate(${cx} 0)`}>
        <circle r={46} fill="url(#ge-glow)" />
        <g transform={`scale(1 ${Math.max(0.05, 1 - blink)})`}>
          <ellipse rx={15} ry={12} fill="#f2ff9e" />
          <ellipse rx={4} ry={10} fill="#1c2a0a" />
        </g>
      </g>
    ))}
  </g>
);

/** Side view, facing right, with a run cycle. `phase` advances the legs; body center at (x, y). */
export const CivetSide: React.FC<{x: number; y: number; s?: number; phase: number; night?: number; flip?: boolean; running?: boolean}> = ({
  x,
  y,
  s = 1,
  phase,
  night = 0,
  flip = false,
  running = true,
}) => {
  const c = palette(night);
  const sw = running ? Math.sin(phase) : 0;
  const bob = running ? -Math.abs(Math.sin(phase)) * 10 : 0;
  const leg = (lx: number, ang: number, back: boolean) => (
    <g transform={`translate(${lx} 18) rotate(${ang})`}>
      <rect x={-11} y={0} width={22} height={62} rx={11} fill={back ? c.mask : c.dark} />
      <ellipse cx={4} cy={60} rx={15} ry={8} fill={back ? c.mask : c.dark} />
    </g>
  );
  const tailY = Math.sin(phase * 0.5) * 14;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s})`}>
      <path d={`M -100 -12 C -170 -30 -220 ${-50 + tailY} -270 ${-96 + tailY}`} stroke={c.dark} strokeWidth={24} fill="none" strokeLinecap="round" />
      <path d={`M -230 ${-62 + tailY} C -250 ${-75 + tailY} -262 ${-86 + tailY} -270 ${-96 + tailY}`} stroke={c.mask} strokeWidth={22} fill="none" strokeLinecap="round" />
      {leg(-74, -32 * sw, true)}
      {leg(70, 32 * sw, true)}
      <ellipse cx={0} cy={0} rx={122} ry={50} fill={c.fur} />
      <ellipse cx={0} cy={22} rx={98} ry={24} fill={c.muzzle} opacity={0.55} />
      <path d="M -110 -20 C -60 -52 60 -52 112 -20" stroke={c.dark} strokeWidth={10} fill="none" opacity={0.45} strokeLinecap="round" />
      {Array.from({length: 3}).map((_, r) =>
        Array.from({length: 7}).map((__, i) => <ellipse key={`${r}-${i}`} cx={-80 + i * 26 + r * 8} cy={-18 + r * 14} rx={6} ry={4} fill={c.spot} />),
      )}
      {leg(-60, 32 * sw, false)}
      {leg(84, -32 * sw, false)}
      <g transform="translate(124 -28)">
        <ellipse cx={-14} cy={-36} rx={13} ry={17} fill={c.dark} transform="rotate(-20 -14 -36)" />
        <path d="M -40 -26 C -10 -54 40 -42 74 -10 C 84 -2 84 8 72 12 C 40 24 -6 26 -34 14 C -50 6 -52 -16 -40 -26 Z" fill={c.fur} />
        <path d="M -14 -22 C 10 -30 40 -20 60 -6 C 40 2 10 4 -12 -2 Z" fill={c.mask} />
        <ellipse cx={8} cy={-30} rx={16} ry={6} fill={c.white} />
        <ellipse cx={16} cy={-12} rx={9} ry={10} fill="#fbfaf6" />
        <circle cx={19} cy={-12} r={6} fill="#16100e" />
        <circle cx={17} cy={-15} r={2.2} fill="#fff" />
        <ellipse cx={0} cy={8} rx={18} ry={8} fill={c.white} opacity={0.9} />
        <ellipse cx={76} cy={2} rx={9} ry={7} fill="#1b1514" />
        <path d="M 44 12 Q 56 20 66 12" stroke="#16100e" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Sitting, facing the viewer. Head drawn on top; optional prop held at the chest. */
export const CivetSit: React.FC<{
  x: number;
  y: number;
  s?: number;
  night?: number;
  blink?: number;
  wink?: number;
  mood?: Mood;
  chew?: number;
  lookX?: number;
  lookY?: number;
  headTilt?: number;
  prop?: 'popcorn' | 'tea' | 'none';
  tailWag?: number;
  squash?: number;
}> = ({x, y, s = 1, night = 0, blink = 0, wink = 0, mood = 'grin', chew = 0, lookX = 0, lookY = 0, headTilt = 0, prop = 'none', tailWag = 0, squash = 0}) => {
  const c = palette(night);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + squash * 0.08)} ${s * (1 - squash * 0.08)})`}>
      <path d={`M 50 200 C 150 210 ${190 + tailWag * 20} 130 ${150 + tailWag * 30} 40`} stroke={c.dark} strokeWidth={28} fill="none" strokeLinecap="round" />
      <path d={`M ${165 + tailWag * 25} 85 C ${160 + tailWag * 28} 65 ${155 + tailWag * 30} 50 ${150 + tailWag * 30} 40`} stroke={c.mask} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d="M -72 40 C -104 120 -96 222 0 226 C 96 222 104 120 72 40 Z" fill={c.fur} />
      <path d="M -40 70 C -54 130 -46 200 0 204 C 46 200 54 130 40 70 Z" fill={c.muzzle} opacity={0.5} />
      {Array.from({length: 2}).map((_, r) =>
        Array.from({length: 4}).map((__, i) => (
          <ellipse key={`${r}-${i}`} cx={(i < 2 ? -78 : 58) + (i % 2) * 14} cy={110 + r * 34 + (i % 2) * 10} rx={6} ry={4} fill={c.spot} />
        )),
      )}
      <ellipse cx={-46} cy={222} rx={30} ry={13} fill={c.mask} />
      <ellipse cx={46} cy={222} rx={30} ry={13} fill={c.mask} />
      {prop === 'popcorn' && (
        <g transform="translate(0 150)">
          <path d="M -46 -40 L 46 -40 L 36 46 L -36 46 Z" fill="#fff6f0" />
          {[-30, -10, 10, 30].map((xx) => (
            <path key={xx} d={`M ${xx - 6} -40 L ${xx + 6} -40 L ${xx * 0.78 + 5} 46 L ${xx * 0.78 - 5} 46 Z`} fill="#e53935" />
          ))}
          {[-34, -16, 2, 20, 36, -24, -6, 12, 28].map((xx, i) => (
            <circle key={i} cx={xx} cy={-44 - (i > 4 ? 14 : 0)} r={12} fill="#fff5d1" stroke="#f0d47a" strokeWidth={2} />
          ))}
        </g>
      )}
      {prop === 'tea' && (
        <g transform="translate(0 140)">
          <path d="M -24 -38 L 24 -38 L 18 34 L -18 34 Z" fill="#c98a3c" opacity={0.92} />
          <path d="M -24 -38 L 24 -38 L 23 -24 L -23 -24 Z" fill="#f3e2c4" />
          <path d="M -24 -38 L 24 -38 L 18 34 L -18 34 Z" fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
        </g>
      )}
      {prop !== 'none' && (
        <g>
          <ellipse cx={-44} cy={prop === 'tea' ? 140 : 128} rx={20} ry={16} fill={c.dark} />
          <ellipse cx={44} cy={prop === 'tea' ? 140 : 128} rx={20} ry={16} fill={c.dark} />
        </g>
      )}
      <CivetHead x={0} y={-10} s={0.92} rot={headTilt} night={night} blink={blink} wink={wink} mood={mood} chew={chew} lookX={lookX} lookY={lookY} />
    </g>
  );
};
