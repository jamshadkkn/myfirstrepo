import React from 'react';
import {random} from 'remotion';
import {mixc, W} from '../lib/anim';

/** Sky from golden afternoon (night=0) to moonlit night (night=1). */
export const Sky: React.FC<{id: string; night: number; t: number; horizon?: number; sunX?: number; moonX?: number; moonY?: number}> = ({
  id,
  night,
  t,
  horizon = 1300,
  sunX = 820,
  moonX = 800,
  moonY = 360,
}) => {
  const top = mixc('#4b9fe0', '#070f2b', night);
  const mid = mixc('#9ed5f3', '#16245a', night);
  const low = mixc('#ffe3ad', '#3a3870', night);
  const sunY = 470 + night * 500;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.6" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fff8de" />
          <stop offset="0.3" stopColor="#ffe9a3" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd77a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-moon`}>
          <stop offset="0" stopColor="#fffbe8" stopOpacity="0.75" />
          <stop offset="0.28" stopColor="#fff3c4" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-300} y={-300} width={W + 600} height={horizon + 300} fill={`url(#${id}-sky)`} />
      {night > 0.04 &&
        Array.from({length: 90}).map((_, i) => {
          const x = random(`sx${i}`) * (W + 200) - 100;
          const y = random(`sy${i}`) * horizon * 0.72 - 120;
          const r = 1.3 + random(`sr${i}`) * 2.8;
          const tw = 0.5 + 0.5 * Math.sin(t * (1.6 + random(`st${i}`) * 3.4) + i * 1.7);
          return <circle key={i} cx={x} cy={y} r={r} fill="#fff7dc" opacity={night * (0.35 + 0.65 * tw)} />;
        })}
      <g opacity={1 - night}>
        <circle cx={sunX} cy={sunY} r={300} fill={`url(#${id}-sun)`} />
        <circle cx={sunX} cy={sunY} r={74} fill="#fff3c9" />
      </g>
      <g opacity={night}>
        <circle cx={moonX} cy={moonY} r={300} fill={`url(#${id}-moon)`} />
        <circle cx={moonX} cy={moonY} r={84} fill="#fff4d2" />
        <circle cx={moonX - 26} cy={moonY - 18} r={16} fill="#eadfbd" />
        <circle cx={moonX + 24} cy={moonY + 22} r={11} fill="#eadfbd" />
        <circle cx={moonX + 30} cy={moonY - 30} r={7} fill="#eadfbd" />
      </g>
    </g>
  );
};

export const Cloud: React.FC<{x: number; y: number; s?: number; night: number; o?: number}> = ({x, y, s = 1, night, o = 1}) => {
  const c = mixc('#ffffff', '#3a4a80', night);
  const sh = mixc('#e4eef7', '#2b3768', night);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o * (1 - night * 0.45)}>
      <ellipse cx={0} cy={18} rx={150} ry={34} fill={sh} />
      <circle cx={-70} cy={0} r={46} fill={c} />
      <circle cx={-10} cy={-28} r={62} fill={c} />
      <circle cx={60} cy={-6} r={50} fill={c} />
      <ellipse cx={0} cy={16} rx={140} ry={30} fill={c} />
    </g>
  );
};

/** Far hills and a tree line along the horizon. */
export const Hills: React.FC<{y?: number; night: number}> = ({y = 1120, night}) => {
  const far = mixc('#8db3c6', '#1c2850', night);
  const near = mixc('#4f8f58', '#102a2c', night);
  const nearDark = mixc('#3c7546', '#0b1f22', night);
  const bumps = Array.from({length: 16}).map((_, i) => ({x: -60 + i * 78, r: 46 + random(`tb${i}`) * 34}));
  return (
    <g transform={`translate(0 ${y - 1120})`}>
      <path d="M -200 1130 C 40 1010 210 1060 380 1090 C 560 1122 660 1000 840 1030 C 980 1052 1100 1080 1300 1060 L 1300 1400 L -200 1400 Z" fill={far} />
      {bumps.map((b, i) => (
        <circle key={i} cx={b.x} cy={1180 - b.r * 0.4} r={b.r} fill={i % 2 ? near : nearDark} />
      ))}
      <rect x={-200} y={1170} width={1500} height={200} fill={near} />
    </g>
  );
};

type P = [number, number];
const quad = (p0: P, c: P, p1: P, u: number): P => [
  (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0],
  (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1],
];

/** Coconut palm. Base at (x, y). `sway` in degrees rocks the crown; `lean` offsets the crown in px. */
export const Palm: React.FC<{x: number; y: number; h: number; lean: number; sway: number; s?: number; night: number; seed?: number}> = ({
  x,
  y,
  h,
  lean,
  sway,
  s = 1,
  night,
  seed = 1,
}) => {
  const p0: P = [0, 0];
  const p1: P = [lean, -h];
  const c: P = [lean * 0.1, -h * 0.55];
  const N = 18;
  const left: P[] = [];
  const right: P[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = quad(p0, c, p1, u);
    const q = quad(p0, c, p1, Math.min(1, u + 0.01));
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const w = 24 - 11 * u;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  }
  const trunk = `M ${left.map((p) => p.join(' ')).join(' L ')} L ${right.reverse().map((p) => p.join(' ')).join(' L ')} Z`;
  const trunkC = mixc('#8c6a48', '#2e2838', night);
  const ringC = mixc('#6e5236', '#1f1a28', night);
  const frondC = mixc('#3f9142', '#14302c', night);
  const frondD = mixc('#2d7134', '#0d2421', night);
  const ribC = mixc('#6b8f2e', '#1c3326', night);
  const angles = [-172, -150, -128, -104, -80, -56, -32, -10, 168];
  const fronds = angles.map((a, k) => {
    const rad = (a * Math.PI) / 180;
    const L = 230 + random(`fl${seed}-${k}`) * 70;
    const droop = 0.25 + Math.abs(Math.cos(rad)) * 0.55;
    const rib: P[] = [];
    for (let i = 0; i <= 14; i++) {
      const sN = i / 14;
      rib.push([Math.cos(rad) * L * sN, Math.sin(rad) * L * sN + droop * L * sN * sN]);
    }
    const side = (sign: number) => {
      const pts: P[] = [rib[1]];
      for (let i = 1; i < 14; i++) {
        const a0 = rib[i];
        const a1 = rib[i + 1];
        const dx = a1[0] - a0[0];
        const dy = a1[1] - a0[1];
        const len = Math.hypot(dx, dy) || 1;
        const tx = dx / len;
        const ty = dy / len;
        const nx = -ty * sign;
        const ny = tx * sign;
        const sN = i / 14;
        const ll = 62 * Math.pow(Math.sin(Math.PI * Math.min(1, sN * 1.05)), 0.7) + 8;
        const tip: P = [a0[0] + (nx * 0.78 + tx * 0.62) * ll, a0[1] + (ny * 0.78 + ty * 0.62) * ll + ll * 0.35];
        pts.push(tip, a1);
      }
      return pts;
    };
    const s1 = side(1);
    const s2 = side(-1);
    const d1 = `M ${s1.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L ')} Z`;
    const d2 = `M ${s2.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L ')} Z`;
    const ribD = `M ${rib.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L ')}`;
    return {d1, d2, ribD, k};
  });
  const rings = Array.from({length: 14}).map((_, i) => {
    const u = 0.05 + (i / 14) * 0.9;
    const p = quad(p0, c, p1, u);
    const w = 24 - 11 * u;
    return <path key={i} d={`M ${p[0] - w} ${p[1]} Q ${p[0]} ${p[1] + 6} ${p[0] + w} ${p[1]}`} stroke={ringC} strokeWidth={3} fill="none" opacity={0.8} />;
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={trunk} fill={trunkC} />
      {rings}
      <g transform={`translate(${p1[0]} ${p1[1]}) rotate(${sway})`}>
        {fronds.map((f) => (
          <g key={f.k}>
            <path d={f.d2} fill={frondD} />
            <path d={f.d1} fill={frondC} />
            <path d={f.ribD} stroke={ribC} strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <circle cx={-14} cy={10} r={17} fill={mixc('#7f9a2c', '#1f2a1c', night)} />
        <circle cx={12} cy={12} r={17} fill={mixc('#6f8a25', '#1c2619', night)} />
        <circle cx={0} cy={26} r={16} fill={mixc('#8aa532', '#222e1e', night)} />
      </g>
    </g>
  );
};

/** Hibiscus bush. */
export const Bush: React.FC<{x: number; y: number; s?: number; night: number; flowers?: number; seed?: number}> = ({x, y, s = 1, night, flowers = 5, seed = 0}) => {
  const g1 = mixc('#3f8c3c', '#102a24', night);
  const g2 = mixc('#2f7533', '#0c211e', night);
  const g3 = mixc('#56a648', '#15352b', night);
  const red = mixc('#e2352e', '#5a1f35', night);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-60} cy={-30} r={52} fill={g2} />
      <circle cx={50} cy={-34} r={56} fill={g2} />
      <circle cx={0} cy={-62} r={64} fill={g1} />
      <circle cx={-30} cy={-20} r={50} fill={g1} />
      <circle cx={34} cy={-18} r={48} fill={g3} />
      <rect x={-110} y={-22} width={220} height={26} rx={13} fill={g2} />
      {Array.from({length: flowers}).map((_, i) => {
        const fx = -80 + random(`bf${seed}-${i}`) * 160;
        const fy = -100 + random(`bg${seed}-${i}`) * 80;
        return (
          <g key={i} transform={`translate(${fx} ${fy})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-9} rx={7} ry={10} fill={red} transform={`rotate(${a})`} />
            ))}
            <circle r={4} fill={mixc('#ffd23f', '#6a5a2a', night)} />
          </g>
        );
      })}
    </g>
  );
};
