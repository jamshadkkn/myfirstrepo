import React from 'react';
import {random} from 'remotion';
import {mixc} from '../lib/anim';

const ML = "'Anek', 'Anek Malayalam', sans-serif";

export const Crown: React.FC<{x: number; y: number; s?: number; rot?: number; o?: number; shine?: number}> = ({x, y, s = 1, rot = 0, o = 1, shine = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <defs>
      <radialGradient id="crownglow">
        <stop offset="0" stopColor="#fff3b0" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ffe27a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx={0} cy={0} r={170} fill="url(#crownglow)" opacity={0.45 + shine * 0.35} />
    <path d="M -80 40 L -92 -40 L -46 -6 L 0 -64 L 46 -6 L 92 -40 L 80 40 Z" fill="#f7c531" stroke="#b8860b" strokeWidth={6} strokeLinejoin="round" />
    <rect x={-82} y={34} width={164} height={26} rx={8} fill="#e6ad1f" stroke="#b8860b" strokeWidth={6} />
    {[-92, 0, 92].map((cx, i) => (
      <circle key={i} cx={cx} cy={i === 1 ? -66 : -42} r={11} fill="#fff1a8" stroke="#b8860b" strokeWidth={4} />
    ))}
    <circle cx={0} cy={10} r={13} fill="#d32f2f" stroke="#8e1b1b" strokeWidth={3} />
    <circle cx={-46} cy={18} r={9} fill="#1e88e5" stroke="#0d47a1" strokeWidth={3} />
    <circle cx={46} cy={18} r={9} fill="#43a047" stroke="#1b5e20" strokeWidth={3} />
    <path d="M -60 -10 L -50 26" stroke="#fff6c7" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
  </g>
);

/** Sparkle star burst. */
export const Sparkle: React.FC<{x: number; y: number; s?: number; o?: number; rot?: number; color?: string}> = ({x, y, s = 1, o = 1, rot = 0, color = '#fff6c2'}) => (
  <path
    transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
    d="M 0 -40 C 6 -10 10 -6 40 0 C 10 6 6 10 0 40 C -6 10 -10 6 -40 0 C -10 -6 -6 -10 0 -40 Z"
    fill={color}
    opacity={o}
  />
);

/** Glass of water on a table. Origin = bottom centre of the glass. */
export const WaterGlass: React.FC<{x: number; y: number; s?: number; tint?: number; ripple?: number; rippleT?: number; t: number}> = ({
  x,
  y,
  s = 1,
  tint = 0,
  ripple = 0,
  rippleT = 0,
  t,
}) => {
  const water = mixc('#8fd3ff', '#e9dd5a', tint);
  const waterDeep = mixc('#5ab7f0', '#d4c13a', tint);
  const level = -190;
  const wav = Math.sin(t * 3) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={96} ry={14} fill="#000" opacity={0.22} />
      <path d={`M -78 ${level} L 78 ${level} L 64 0 L -64 0 Z`} fill={waterDeep} opacity={0.9} />
      <path d={`M -78 ${level} L 78 ${level} L 70 -80 L -70 -80 Z`} fill={water} opacity={0.75} />
      <ellipse cx={0} cy={level + wav} rx={78} ry={14} fill={mixc('#c7ecff', '#fff3a0', tint)} />
      {ripple > 0 &&
        [0, 1, 2].map((k) => {
          const p = Math.max(0, Math.min(1, rippleT * 1.6 - k * 0.25));
          return p > 0 && p < 1 ? <ellipse key={k} cx={0} cy={level + wav} rx={10 + p * 70} ry={2 + p * 12} fill="none" stroke="#ffffff" strokeWidth={4 * (1 - p)} opacity={ripple * (1 - p)} /> : null;
        })}
      <path d="M -92 -290 L 92 -290 L 72 0 L -72 0 Z" fill="#e8f6ff" opacity={0.22} stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={0} cy={-290} rx={92} ry={15} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.85} />
      <path d="M -62 -260 L -52 -30" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.45} />
    </g>
  );
};

/** Teardrop with squash & stretch. `stretch` > 1 elongates. */
export const Drop: React.FC<{x: number; y: number; s?: number; stretch?: number; color?: string}> = ({x, y, s = 1, stretch = 1, color = '#f1df4f'}) => (
  <g transform={`translate(${x} ${y}) scale(${s / Math.sqrt(stretch)} ${s * stretch})`}>
    <path d="M 0 -26 C 8 -12 16 -2 16 8 C 16 18 9 24 0 24 C -9 24 -16 18 -16 8 C -16 -2 -8 -12 0 -26 Z" fill={color} stroke="#b9a020" strokeWidth={2} />
    <ellipse cx={-5} cy={6} rx={4} ry={6} fill="#fff" opacity={0.7} />
  </g>
);

/** Splash droplets flying out of the glass after the hit. p = 0..1 */
export const Splash: React.FC<{x: number; y: number; p: number; color?: string}> = ({x, y, p, color = '#f1df4f'}) => {
  if (p <= 0 || p >= 1) return null;
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({length: 9}).map((_, i) => {
        const a = -Math.PI / 2 + (i - 4) * 0.28;
        const v = 260 + random(`sp${i}`) * 160;
        const xx = Math.cos(a) * v * p;
        const yy = Math.sin(a) * v * p + 900 * p * p;
        return <circle key={i} cx={xx} cy={yy} r={(10 - i % 3 * 2) * (1 - p * 0.6)} fill={color} opacity={1 - p} />;
      })}
    </g>
  );
};

/** Event podium with a microphone; the speaker is left to the imagination. */
export const Podium: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={8} rx={200} ry={22} fill="#000" opacity={0.2} />
    <path d="M -150 -300 L 150 -300 L 120 0 L -120 0 Z" fill="#8b5a2b" />
    <path d="M -150 -300 L 150 -300 L 145 -262 L -145 -262 Z" fill="#a8723c" />
    <path d="M -100 -230 L 100 -230 L 88 -110 L -88 -110 Z" fill="#6e4520" />
    <circle cx={0} cy={-170} r={34} fill="#c9a23a" stroke="#8a6d1f" strokeWidth={5} />
    <path d="M 0 -194 L 7 -178 L 24 -176 L 11 -165 L 15 -148 L 0 -157 L -15 -148 L -11 -165 L -24 -176 L -7 -178 Z" fill="#fff2b3" />
    <path d="M 40 -300 C 40 -350 60 -390 90 -410" stroke="#2c2c2c" strokeWidth={8} fill="none" strokeLinecap="round" />
    <rect x={78} y={-450} width={30} height={52} rx={15} fill="#3a3a3a" transform="rotate(-30 93 -424)" />
    <rect x={80} y={-448} width={26} height={22} rx={11} fill="#777" transform="rotate(-30 93 -424)" />
  </g>
);

export const SpeechBubble: React.FC<{x: number; y: number; s?: number; o?: number; dots: number}> = ({x, y, s = 1, o = 1, dots}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -170 -110 Q -170 -170 -110 -170 L 110 -170 Q 170 -170 170 -110 L 170 -20 Q 170 40 110 40 L 0 40 L -50 100 L -40 40 L -110 40 Q -170 40 -170 -20 Z" fill="#fff" stroke="#222" strokeWidth={7} />
    {[0, 1, 2].map((k) => (
      <circle key={k} cx={-60 + k * 60} cy={-65} r={18} fill="#222" opacity={dots > k ? 1 : 0.15} />
    ))}
  </g>
);

/** Bed seen from the side with someone tucked under a blanket (no face shown). */
export const Bed: React.FC<{x: number; y: number; s?: number; night: number; toss?: number; pillowUp?: number}> = ({x, y, s = 1, night, toss = 0, pillowUp = 0}) => {
  const wood = mixc('#7a4a2a', '#3b2630', night);
  const sheet = mixc('#f4efe6', '#7c7f9e', night);
  const blanket = mixc('#3f6fb5', '#28376a', night);
  const blanketHi = mixc('#5b8ad0', '#33467e', night);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-330} y={-60} width={660} height={60} rx={10} fill={wood} />
      <rect x={-330} y={-200} width={36} height={260} rx={10} fill={wood} />
      <rect x={294} y={-130} width={36} height={190} rx={10} fill={wood} />
      <rect x={-300} y={-100} width={600} height={46} rx={18} fill={sheet} />
      <g transform={`translate(${-210 + toss * 6} ${-120 - pillowUp * 40}) rotate(${-pillowUp * 25})`}>
        <ellipse cx={0} cy={0} rx={80} ry={34} fill={sheet} stroke={mixc('#d9d2c4', '#5c5f7e', night)} strokeWidth={4} />
      </g>
      <path
        d={`M -250 -96 C -240 ${-190 - toss * 20} -120 ${-176 + toss * 14} -20 ${-150 - toss * 10} C 80 ${-128 + toss * 8} 180 -150 300 -110 L 300 -60 L -260 -60 Z`}
        fill={blanket}
      />
      <path d={`M -220 -110 C -150 ${-160 - toss * 10} -60 ${-150 + toss * 6} 40 -130`} stroke={blanketHi} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M -170 -128 Q -160 -150 -150 -132 Q -140 -150 -130 -130" stroke={mixc('#2a2a2a', '#151520', night)} strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - pillowUp} />
    </g>
  );
};

export const TableLamp: React.FC<{x: number; y: number; s?: number; on?: number}> = ({x, y, s = 1, on = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <radialGradient id="lampglow">
        <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.85" />
        <stop offset="1" stopColor="#ffc35a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx={0} cy={-150} r={260} fill="url(#lampglow)" opacity={on * 0.7} />
    <rect x={-8} y={-120} width={16} height={110} fill="#8a6d3b" />
    <ellipse cx={0} cy={-8} rx={46} ry={12} fill="#6e5530" />
    <path d="M -70 -120 L 70 -120 L 44 -220 L -44 -220 Z" fill={on > 0.5 ? '#ffe3a1' : '#d9c7a0'} stroke="#c9a463" strokeWidth={4} />
  </g>
);

/** Traditional brass oil lamp (nilavilakku), lit for the house-warming. */
export const Nilavilakku: React.FC<{x: number; y: number; s?: number; t: number; lit?: number}> = ({x, y, s = 1, t, lit = 1}) => {
  const fl = 1 + Math.sin(t * 17) * 0.08 + Math.sin(t * 29) * 0.05;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={60} ry={14} fill="#a77a17" />
      <path d="M -50 0 C -40 -20 -16 -24 -10 -40 L -8 -160 L 8 -160 L 10 -40 C 16 -24 40 -20 50 0 Z" fill="#d4a62a" />
      <ellipse cx={0} cy={-90} rx={16} ry={10} fill="#c18f1c" />
      <path d="M -70 -170 C -60 -150 60 -150 70 -170 Z" fill="#e2b53a" stroke="#a77a17" strokeWidth={3} />
      <path d="M 0 -200 L 10 -176 L -10 -176 Z" fill="#c18f1c" />
      {[-56, 0, 56].map((fx, i) => (
        <g key={i} transform={`translate(${fx} ${-176 + (i === 1 ? -26 : 0)}) scale(${lit * fl} ${lit * fl})`}>
          <ellipse cx={0} cy={-6} rx={30} ry={36} fill="#ffcf5a" opacity={0.25} />
          <path d="M 0 -34 C 9 -18 10 -6 0 0 C -10 -6 -9 -18 0 -34 Z" fill="#ffb300" />
          <path d="M 0 -22 C 4 -13 4 -6 0 -2 C -4 -6 -4 -13 0 -22 Z" fill="#fff4c2" />
        </g>
      ))}
    </g>
  );
};

/** Official white SUV, side view, facing right. */
export const Car: React.FC<{x: number; y: number; s?: number; flip?: boolean; night: number}> = ({x, y, s = 1, flip = false, night}) => {
  const body = mixc('#f7f7f4', '#8d90ad', night);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M -150 -40 L -140 -96 Q -134 -110 -110 -112 L 50 -112 Q 78 -112 96 -90 L 120 -60 L 150 -54 Q 162 -50 162 -36 L 162 -10 L -158 -10 Z" fill={body} />
      <path d="M -116 -100 L 40 -100 Q 60 -100 74 -84 L 92 -62 L -120 -62 Z" fill={mixc('#2d3f52', '#1a2234', night)} />
      <rect x={-30} y={-100} width={8} height={38} fill={body} />
      <rect x={-140} y={-36} width={300} height={8} fill={mixc('#c9c9c4', '#6f7290', night)} />
      <circle cx={150} cy={-46} r={8} fill="#ffe082" opacity={0.6 + night * 0.4} />
      {[-90, 100].map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy={-6} r={30} fill="#1f1f1f" />
          <circle cx={wx} cy={-6} r={14} fill="#bdbdbd" />
        </g>
      ))}
    </g>
  );
};

/** Wooden ceiling boards seen from below, with a gap at `gapX`. */
export const Ceiling: React.FC<{y: number; night: number; gapX?: number; gap?: number; shake?: number}> = ({y, night, gapX = 540, gap = 0, shake = 0}) => {
  const wood = mixc('#8b5e34', '#3e2a2c', night);
  const woodD = mixc('#6b4423', '#2a1c20', night);
  return (
    <g transform={`translate(${shake} 0)`}>
      <rect x={-200} y={y - 400} width={1480} height={400} fill={woodD} />
      {Array.from({length: 12}).map((_, i) => {
        const x0 = -200 + i * 130;
        return <rect key={i} x={x0} y={y - 70} width={124} height={70} fill={wood} stroke={woodD} strokeWidth={4} />;
      })}
      <rect x={-200} y={y} width={1480} height={26} fill={woodD} />
      {gap > 0 && <path d={`M ${gapX - 70 * gap} ${y - 70} L ${gapX + 70 * gap} ${y - 70} L ${gapX + 52 * gap} ${y + 26} L ${gapX - 58 * gap} ${y + 26} Z`} fill="#0d0907" />}
    </g>
  );
};

/** Falling dust specks; p = time since the thump (s). */
export const Dust: React.FC<{x: number; y: number; age: number; seed: number; w?: number}> = ({x, y, age, seed, w = 500}) => {
  if (age < 0 || age > 1.4) return null;
  return (
    <g>
      {Array.from({length: 14}).map((_, i) => {
        const dx = (random(`dx${seed}-${i}`) - 0.5) * w;
        const v = 60 + random(`dv${seed}-${i}`) * 140;
        const yy = y + v * age + 160 * age * age;
        return <circle key={i} cx={x + dx + Math.sin(age * 6 + i) * 8} cy={yy} r={3 + random(`dr${seed}-${i}`) * 4} fill="#d8c7a8" opacity={Math.max(0, 0.9 - age * 0.65)} />;
      })}
    </g>
  );
};

/** Onomatopoeia burst like "ധും!". */
export const Boom: React.FC<{x: number; y: number; text: string; p: number; rot?: number; color?: string; size?: number}> = ({x, y, text, p, rot = -8, color = '#ffd400', size = 84}) => {
  if (p <= 0 || p >= 1) return null;
  const sc = p < 0.2 ? 0.4 + (p / 0.2) * 0.75 : 1.15 - (p - 0.2) * 0.2;
  const o = p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={o}>
      <path d="M 0 -120 L 26 -62 L 92 -96 L 66 -34 L 132 -12 L 66 16 L 96 78 L 30 52 L 0 112 L -30 52 L -96 78 L -66 16 L -132 -12 L -66 -34 L -92 -96 L -26 -62 Z" fill="#e53935" stroke="#7f1010" strokeWidth={6} />
      <text x={0} y={size * 0.33} textAnchor="middle" fontFamily={ML} fontWeight={800} fontSize={size} fill={color} stroke="#2b0a0a" strokeWidth={10} paintOrder="stroke">
        {text}
      </text>
    </g>
  );
};
