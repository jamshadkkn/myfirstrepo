import React from 'react';
import {mixc} from '../lib/anim';

const ML = "'Anek', 'Anek Malayalam', sans-serif";

/** Arch-topped opening path. */
const arch = (cx: number, top: number, bottom: number, hw: number) =>
  `M ${cx - hw} ${bottom} L ${cx - hw} ${top} A ${hw} ${hw} 0 0 1 ${cx + hw} ${top} L ${cx + hw} ${bottom} Z`;

/** Marigold garland swag between two points. */
export const Garland: React.FC<{x1: number; x2: number; y: number; sag: number; n?: number; o?: number}> = ({x1, x2, y, sag, n = 16, o = 1}) => (
  <g opacity={o}>
    {Array.from({length: n + 1}).map((_, i) => {
      const u = i / n;
      const x = x1 + (x2 - x1) * u;
      const yy = y + Math.sin(Math.PI * u) * sag;
      return <circle key={i} cx={x} cy={yy} r={9} fill={i % 3 === 0 ? '#ff7a00' : i % 3 === 1 ? '#ffb000' : '#ff9a1a'} stroke="#d35400" strokeWidth={1.5} />;
    })}
    {[x1, x2].map((x, k) => (
      <g key={k}>
        {[0, 1, 2, 3].map((j) => (
          <circle key={j} cx={x} cy={y + 14 + j * 16} r={8} fill={j % 2 ? '#ffb000' : '#ff7a00'} stroke="#d35400" strokeWidth={1.5} />
        ))}
      </g>
    ))}
  </g>
);

/** The Cliff House bungalow (heritage two-storey, tiled hip roof, front gable with a lattice vent). */
export const CliffHouse: React.FC<{
  id: string;
  night: number;
  lit?: number;
  decor?: number;
  ventGlow?: number;
  t: number;
}> = ({id, night, lit = 0, decor = 0, ventGlow = 0, t}) => {
  const wall = mixc('#f3e9d2', '#454a6e', night);
  const wallShade = mixc('#e2d4b4', '#363a5c', night);
  const band = mixc('#e8dcc0', '#3e4266', night);
  const roof = mixc('#bd4a2d', '#4a2638', night);
  const roofHi = mixc('#d4673f', '#5c3045', night);
  const roofLine = mixc('#8c321f', '#2c1624', night);
  const wood = mixc('#6b3e22', '#2b1b22', night);
  const shutter = mixc('#2f6e50', '#1b3036', night);
  const glassC = mixc('#3e5660', '#1b2236', night);
  const archIn = mixc('#5e4a39', '#2a2230', night);
  const warm = '#ffcf6e';
  const winLit = (i: number) => Math.max(0, Math.min(1, lit * 1.6 - (i % 3) * 0.25));
  const flick = 0.92 + 0.08 * Math.sin(t * 9);
  return (
    <g>
      <defs>
        <pattern id={`${id}-tiles`} width="38" height="22" patternUnits="userSpaceOnUse">
          <path d="M 0 22 Q 19 4 38 22" stroke={roofLine} strokeWidth="3" fill="none" />
          <path d="M 19 11 L 19 22" stroke={roofLine} strokeWidth="1.5" opacity="0.5" />
        </pattern>
        <linearGradient id={`${id}-roofg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={roofHi} />
          <stop offset="1" stopColor={roof} />
        </linearGradient>
        <radialGradient id={`${id}-warm`}>
          <stop offset="0" stopColor="#ffe6a3" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb84d" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-ventclip`}>
          <path d="M 478 762 L 540 682 L 602 762 Z" />
        </clipPath>
        <radialGradient id={`${id}-eyeglow`}>
          <stop offset="0" stopColor="#e6ff7a" stopOpacity="1" />
          <stop offset="0.4" stopColor="#c8ff4d" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c8ff4d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* plinth */}
      <rect x={118} y={1192} width={844} height={46} fill={mixc('#cbbd9c', '#33354e', night)} />
      <rect x={118} y={1192} width={844} height={8} fill={mixc('#ded2b4', '#3d405c', night)} />

      {/* ground floor */}
      <rect x={150} y={975} width={780} height={220} fill={wall} />
      <rect x={150} y={1150} width={780} height={45} fill={wallShade} />
      {[205, 300, 395, 685, 780, 875].map((cx, i) => (
        <g key={cx}>
          <path d={arch(cx, 1050, 1195, 36)} fill={archIn} />
          <path d={arch(cx, 1050, 1195, 36)} fill={warm} opacity={winLit(i + 1) * 0.85 * flick} />
          <path d={arch(cx, 1050, 1195, 36)} fill="none" stroke={band} strokeWidth={6} />
        </g>
      ))}
      <rect x={140} y={965} width={800} height={18} fill={band} />

      {/* first floor */}
      <rect x={190} y={765} width={700} height={205} fill={wall} />
      {[250, 340, 430, 650, 740, 830].map((cx, i) => (
        <g key={cx}>
          <rect x={cx - 52} y={818} width={20} height={112} fill={shutter} />
          <rect x={cx + 32} y={818} width={20} height={112} fill={shutter} />
          <path d={arch(cx, 840, 930, 30)} fill={glassC} />
          <path d={arch(cx, 840, 930, 30)} fill={warm} opacity={winLit(i) * flick} />
          <path d={arch(cx, 840, 930, 30)} fill="none" stroke="#f8f1df" strokeWidth={5} opacity={1 - night * 0.6} />
          <line x1={cx} y1={812} x2={cx} y2={930} stroke="#f8f1df" strokeWidth={3} opacity={1 - night * 0.6} />
        </g>
      ))}
      {/* window light spill at night */}
      {lit > 0 && [250, 340, 430, 650, 740, 830].map((cx, i) => <circle key={cx} cx={cx} cy={880} r={120} fill={`url(#${id}-warm)`} opacity={winLit(i) * 0.5} />)}

      {/* portico */}
      <rect x={430} y={985} width={220} height={26} fill={band} />
      {[450, 497, 583, 630].map((x) => (
        <rect key={x} x={x - 9} y={1011} width={18} height={184} fill={mixc('#fbf6ea', '#5a5f86', night)} />
      ))}
      <rect x={430} y={900} width={220} height={12} fill={band} />
      {Array.from({length: 12}).map((_, i) => (
        <rect key={i} x={440 + i * 18} y={912} width={7} height={55} rx={3} fill={band} />
      ))}
      <path d={arch(540, 830, 965, 34)} fill={wood} />
      <path d={arch(540, 830, 965, 34)} fill={warm} opacity={winLit(2) * 0.7} />
      <rect x={430} y={962} width={220} height={10} fill={band} />

      {/* main hip roof */}
      <path d="M 120 775 L 330 590 L 750 590 L 960 775 Z" fill={`url(#${id}-roofg)`} />
      <path d="M 120 775 L 330 590 L 750 590 L 960 775 Z" fill={`url(#${id}-tiles)`} opacity={0.9} />
      <path d="M 330 590 L 750 590" stroke={roofLine} strokeWidth={10} strokeLinecap="round" />
      <path d="M 120 775 L 960 775" stroke={roofLine} strokeWidth={8} />

      {/* front gable with lattice vent */}
      <path d="M 442 776 L 540 650 L 638 776 Z" fill={mixc('#e8dcc0', '#3a3d5e', night)} />
      <path d="M 478 762 L 540 682 L 602 762 Z" fill={mixc('#2a1c15', '#120c10', night)} />
      <g clipPath={`url(#${id}-ventclip)`}>
        <circle cx={540} cy={738} r={60} fill={`url(#${id}-eyeglow)`} opacity={ventGlow * 0.5} />
        {ventGlow > 0.01 && (
          <g opacity={ventGlow}>
            <ellipse cx={528} cy={740} rx={6} ry={5} fill="#eaff7d" />
            <ellipse cx={552} cy={740} rx={6} ry={5} fill="#eaff7d" />
          </g>
        )}
        {Array.from({length: 10}).map((_, i) => (
          <g key={i}>
            <line x1={440 + i * 18} y1={780} x2={500 + i * 18} y2={680} stroke={wood} strokeWidth={4} />
            <line x1={460 + i * 18} y1={680} x2={520 + i * 18} y2={780} stroke={wood} strokeWidth={4} />
          </g>
        ))}
      </g>
      <path d="M 430 784 L 540 640 L 650 784" stroke={wood} strokeWidth={16} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M 540 640 L 540 622" stroke={wood} strokeWidth={8} strokeLinecap="round" />
      <circle cx={540} cy={616} r={9} fill={mixc('#c9a23a', '#4a3a2a', night)} />

      {/* 2026 house-warming decor */}
      {decor > 0.01 && (
        <g opacity={decor}>
          <Garland x1={436} x2={644} y={1000} sag={40} />
          <Garland x1={190} x2={430} y={972} sag={22} n={14} />
          <Garland x1={650} x2={890} y={972} sag={22} n={14} />
          <g transform="translate(540 936)">
            <path d="M -150 -36 L 150 -36 L 134 0 L 150 36 L -150 36 L -134 0 Z" fill="#c62828" stroke="#ffd54f" strokeWidth={4} />
            <text x={0} y={13} textAnchor="middle" fontFamily={ML} fontWeight={800} fontSize={40} fill="#fff3c4">
              സ്വാഗതം
            </text>
          </g>
        </g>
      )}
    </g>
  );
};

/** Front compound wall, gate with pillars and lamps, name board, lawn and driveway. */
export const Grounds: React.FC<{id: string; night: number; t: number; banner?: number; lampLit?: number}> = ({id, night, t, banner = 0, lampLit = 0}) => {
  const lawnTop = mixc('#79b34f', '#1b3a2b', night);
  const lawnBot = mixc('#3f7f35', '#0e2420', night);
  const wallC = mixc('#eadfc4', '#4a4a66', night);
  const coping = mixc('#cdbf9f', '#383a55', night);
  const pillar = mixc('#e2d5b6', '#45465f', night);
  const iron = mixc('#2b2b33', '#121218', night);
  const drive = mixc('#dcd2bb', '#3a3a50', night);
  const lamp = 0.25 + lampLit * 0.75;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-lawn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lawnTop} />
          <stop offset="1" stopColor={lawnBot} />
        </linearGradient>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#fff2b8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffcf5a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-300} y={1232} width={1680} height={900} fill={`url(#${id}-lawn)`} />
      <path d="M 470 1236 L 610 1236 L 760 1700 L 320 1700 Z" fill={drive} />
      {/* wall left and right of gate */}
      <rect x={-300} y={1392} width={700} height={88} fill={wallC} />
      <rect x={680} y={1392} width={700} height={88} fill={wallC} />
      <rect x={-300} y={1382} width={700} height={14} fill={coping} />
      <rect x={680} y={1382} width={700} height={14} fill={coping} />
      {/* gate leaves */}
      {Array.from({length: 13}).map((_, i) => (
        <rect key={i} x={428 + i * 18} y={1392} width={6} height={90} fill={iron} />
      ))}
      <path d="M 428 1398 Q 540 1350 652 1398" stroke={iron} strokeWidth={7} fill="none" />
      <rect x={428} y={1430} width={224} height={6} fill={iron} />
      {/* pillars with lamps */}
      {[408, 672].map((x) => (
        <g key={x}>
          <rect x={x - 24} y={1320} width={48} height={165} fill={pillar} />
          <rect x={x - 30} y={1312} width={60} height={14} fill={coping} />
          <circle cx={x} cy={1292} r={60} fill={`url(#${id}-lamp)`} opacity={lamp * night} />
          <circle cx={x} cy={1292} r={17} fill={mixc('#fff4c9', '#ffe08a', night)} opacity={0.6 + lamp * 0.4} />
          <rect x={x - 5} y={1306} width={10} height={8} fill={iron} />
        </g>
      ))}
      {/* name board */}
      <g>
        <rect x={150} y={1404} width={210} height={58} rx={6} fill={mixc('#1f5c43', '#123326', night)} stroke="#d9b35a" strokeWidth={4} />
        <text x={255} y={1444} textAnchor="middle" fontFamily={ML} fontWeight={800} fontSize={30} fill="#ffe7a1">
          ക്ലിഫ് ഹൗസ്
        </text>
      </g>
      {/* welcome banner for 2026 */}
      {banner > 0.01 && (
        <g opacity={banner} transform={`translate(540 ${1245 - (1 - banner) * 40})`}>
          <path d="M -150 -34 L 150 -34 L 136 0 L 150 34 L -150 34 L -136 0 Z" fill="#c62828" stroke="#ffd54f" strokeWidth={4} />
          <text x={0} y={12} textAnchor="middle" fontFamily={ML} fontWeight={800} fontSize={38} fill="#fff3c4">
            സ്വാഗതം
          </text>
        </g>
      )}
      {/* sentry box */}
      <g>
        <rect x={760} y={1300} width={92} height={110} fill={mixc('#d8cdb0', '#3d3e57', night)} />
        <path d="M 748 1304 L 806 1272 L 864 1304 Z" fill={mixc('#a5432a', '#3b2030', night)} />
        <rect x={778} y={1322} width={56} height={44} fill={mixc('#3e5660', '#1b2236', night)} />
        <rect x={778} y={1322} width={56} height={44} fill="#ffcf6e" opacity={night * 0.6} />
      </g>
    </g>
  );
};

/** Kerala police guard; `salute` 0..1 raises the hand. Feet at (x, y). */
export const Guard: React.FC<{x: number; y: number; s?: number; night: number; salute: number}> = ({x, y, s = 1, night, salute}) => {
  const khaki = mixc('#c9a865', '#4f4a4a', night);
  const khakiD = mixc('#a98b4f', '#3c3838', night);
  const skin = mixc('#8a5a3b', '#3e2a28', night);
  const armRot = -150 * salute;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={34} ry={7} fill="#000" opacity={0.18} />
      <rect x={-20} y={-70} width={17} height={68} rx={5} fill={khakiD} />
      <rect x={3} y={-70} width={17} height={68} rx={5} fill={khakiD} />
      <ellipse cx={-12} cy={-2} rx={13} ry={6} fill="#1b1b1b" />
      <ellipse cx={12} cy={-2} rx={13} ry={6} fill="#1b1b1b" />
      <rect x={-26} y={-138} width={52} height={74} rx={14} fill={khaki} />
      <rect x={-26} y={-78} width={52} height={9} fill="#5a3d24" />
      <rect x={-5} y={-79} width={10} height={11} fill="#c9a23a" />
      {/* left arm (down) */}
      <rect x={22} y={-134} width={14} height={60} rx={7} fill={khaki} />
      <circle cx={29} cy={-72} r={7} fill={skin} />
      {/* right arm (salute) */}
      <g transform={`translate(-29 -128) rotate(${armRot})`}>
        <rect x={-7} y={0} width={14} height={34} rx={7} fill={khaki} />
        <g transform={`translate(0 30) rotate(${salute * 95})`}>
          <rect x={-6} y={0} width={12} height={30} rx={6} fill={khaki} />
          <ellipse cx={0} cy={34} rx={7} ry={9} fill={skin} />
        </g>
      </g>
      {/* head */}
      <rect x={-7} y={-148} width={14} height={14} fill={skin} />
      <ellipse cx={0} cy={-170} rx={22} ry={25} fill={skin} />
      <path d="M -16 -160 Q 0 -150 16 -160 Q 8 -153 0 -156 Q -8 -153 -16 -160 Z" fill="#141414" />
      <circle cx={-8} cy={-174} r={3} fill="#141414" />
      <circle cx={8} cy={-174} r={3} fill="#141414" />
      {/* peaked cap */}
      <path d="M -26 -186 Q 0 -222 26 -186 Z" fill={khaki} />
      <rect x={-26} y={-191} width={52} height={9} fill="#7a1d1d" />
      <path d="M -24 -184 Q 0 -178 28 -186 L 30 -181 Q 0 -172 -24 -180 Z" fill="#111" />
      <circle cx={0} cy={-198} r={5} fill="#d9b35a" />
    </g>
  );
};
