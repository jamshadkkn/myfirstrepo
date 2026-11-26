import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CivetHead, CivetSide, GlowEyes} from '../art/civet';
import {Bush, Cloud, Hills, Palm, Sky} from '../art/env';
import {CliffHouse, Grounds, Guard} from '../art/house';
import {Bed, Boom, Ceiling, Crown, Dust, Podium, Sparkle, SpeechBubble} from '../art/props';
import {blink, easeIn, easeInOut, easeOut, EV, hitShake, ip, lerp, line, pop, prog, scene} from '../lib/anim';
import {Calendar, IntroCard, LocationTag, TopTitle} from '../ui/ui';
import {Cam, Layer} from './common';

type SP = {t: number};

/** Shared Cliff House set: sky, hills, house, grounds, palms, bushes, guard. */
export const HouseSet: React.FC<{t: number; night: number; lit: number; salute?: number; ventGlow?: number; decor?: number; banner?: number; id: string}> = ({
  t,
  night,
  lit,
  salute = 0,
  ventGlow = 0,
  decor = 0,
  banner = 0,
  id,
}) => (
  <g>
    <Sky id={`${id}-sky`} night={night} t={t} />
    <Cloud x={160 + t * 9} y={300} s={0.9} night={night} />
    <Cloud x={980 + t * 6} y={170} s={0.6} night={night} o={0.9} />
    <Hills night={night} />
    <CliffHouse id={`${id}-house`} night={night} lit={lit} t={t} ventGlow={ventGlow} decor={decor} />
    <Grounds id={`${id}-grounds`} night={night} t={t} lampLit={lit} banner={banner} />
    <Bush x={175} y={1252} night={night} seed={1} />
    <Bush x={905} y={1252} night={night} seed={2} />
    <Guard x={735} y={1478} s={0.9} night={night} salute={salute} />
    <Palm x={60} y={1520} h={930} lean={70} sway={2.5 * Math.sin(t * 1.3)} night={night} seed={1} />
    <Palm x={1020} y={1540} h={840} lean={-90} sway={-2.5 * Math.sin(t * 1.1 + 1)} night={night} seed={2} />
  </g>
);

export const Teaser: React.FC<SP> = ({t}) => {
  const o = prog(t, 0.05, 0.35, easeOut);
  const b = blink(t, [EV.teaserBlink]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 43%, #141a33 0%, #05060c 70%)'}}>
      <Layer>
        <GlowEyes x={540} y={820} s={2.3} blink={b} o={o} gap={44} />
      </Layer>
    </AbsoluteFill>
  );
};

export const Establish: React.FC<SP> = ({t}) => {
  const S = scene('establish');
  const z = lerp(1.0, 1.1, prog(t, S.start, S.end, easeInOut));
  const cy = lerp(960, 930, prog(t, S.start, S.end, easeInOut));
  const salute = prog(t, EV.salute, EV.salute + 0.35, easeOut);
  const ring = prog(t, EV.houseName, EV.houseName + 0.8, easeOut);
  return (
    <AbsoluteFill>
      <Cam cx={540} cy={cy} z={z}>
        <HouseSet id="est" t={t} night={0} lit={0} salute={salute} />
        {t > EV.houseName && t < EV.houseName + 1.2 && (
          <g opacity={1 - ring}>
            <rect x={150 - ring * 30} y={1404 - ring * 30} width={210 + ring * 60} height={58 + ring * 60} rx={16} fill="none" stroke="#FFD83A" strokeWidth={8} />
          </g>
        )}
        {t > EV.salute && <Sparkle x={540} y={560} s={0.6 + 0.4 * pop(t, EV.salute)} o={1 - prog(t, EV.salute + 0.5, EV.salute + 1.0)} />}
      </Cam>
      <TopTitle t={t} tIn={EV.titleIn} tOut={S.end - 0.35} />
      <LocationTag t={t} tIn={EV.locIn} tOut={line('L2').start} />
    </AbsoluteFill>
  );
};

export const Boss: React.FC<SP> = ({t}) => {
  const S = scene('boss');
  const night = prog(t, S.start, S.start + 1.3, easeInOut);
  const lit = prog(t, S.start + 0.7, S.start + 1.6, easeOut);
  const pz = prog(t, S.start, EV.crownIn, easeInOut);
  const pz2 = prog(t, EV.crownDrop + 0.4, S.end + 0.2, easeIn);
  const z = lerp(1.1, 1.5, pz) + pz2 * 0.9;
  const cy = lerp(930, 760, pz) + pz2 * -25;
  const crownS = pop(t, EV.crownIn, {damping: 9, stiffness: 160});
  const fall = Math.max(0, t - EV.crownDrop);
  const crownY = 520 + Math.sin(t * 3) * 6 + 2400 * fall * fall;
  const crownRot = fall * 260;
  const ventGlow = prog(t, EV.crownDrop + 0.55, EV.crownDrop + 0.9, easeOut);
  return (
    <AbsoluteFill>
      <Cam cx={540} cy={cy} z={z}>
        <HouseSet id="boss" t={t} night={night} lit={lit} salute={1 - prog(t, S.start, S.start + 0.4)} ventGlow={ventGlow * (1 - blink(t, [S.end - 0.6]))} />
        {t > EV.crownIn && crownY < 2200 && <Crown x={540} y={crownY} s={0.55 * crownS} rot={crownRot} shine={0.5 + 0.5 * Math.sin(t * 6)} />}
        {t > EV.crownIn && t < EV.crownDrop && (
          <g>
            <Sparkle x={470} y={470} s={0.35 + 0.15 * Math.sin(t * 9)} rot={t * 90} />
            <Sparkle x={620} y={500} s={0.3 + 0.12 * Math.sin(t * 11 + 1)} rot={-t * 80} />
          </g>
        )}
      </Cam>
      {t > EV.crownDrop - 0.05 && t < EV.crownDrop + 0.5 && (
        <Layer>
          <g
            transform={`translate(540 560) rotate(-8) scale(${1 + 0.3 * (1 - prog(t, EV.crownDrop - 0.05, EV.crownDrop + 0.1, easeOut))})`}
            opacity={1 - prog(t, EV.crownDrop + 0.25, EV.crownDrop + 0.5)}
          >
            {[45, -45].map((a) => (
              <g key={a} transform={`rotate(${a})`}>
                <rect x={-150} y={-30} width={300} height={60} rx={30} fill="#3a0606" />
                <rect x={-140} y={-20} width={280} height={40} rx={20} fill="#e53935" />
              </g>
            ))}
          </g>
        </Layer>
      )}
    </AbsoluteFill>
  );
};

export const Reveal: React.FC<SP> = ({t}) => {
  const S = scene('reveal');
  const punch = pop(t, EV.civetPop, {damping: 12, stiffness: 220});
  const z = 3.1 + 0.25 * punch + prog(t, S.start, S.end, easeInOut) * 0.1;
  const eyes = 1 - prog(t, EV.civetPop - 0.05, EV.civetPop + 0.05);
  const b = blink(t, [EV.eyesBlink + 0.1, EV.eyesBlink + 0.45]);
  const flash = t > EV.civetPop ? Math.max(0, 1 - (t - EV.civetPop) / 0.22) : 0;
  const heads = [
    {x: 540, y: 990, s: 1.25, rot: 0, d: 0, mood: 'grin' as const, look: 0},
    {x: 235, y: 1090, s: 0.98, rot: -16, d: 0.12, mood: 'smug' as const, look: 0.5},
    {x: 850, y: 1090, s: 0.98, rot: 16, d: 0.22, mood: 'grin' as const, look: -0.5},
  ];
  return (
    <AbsoluteFill>
      <Cam cx={540} cy={728} z={z}>
        <HouseSet id="rev" t={t} night={1} lit={1} ventGlow={eyes * (1 - b)} />
      </Cam>
      <Layer>
        {heads.map((h, i) => {
          const sp = pop(t, EV.civetPop + h.d, {damping: 10, stiffness: 190, mass: 0.7});
          if (sp <= 0.001) return null;
          const bob = Math.sin(t * 4 + i) * 6;
          return (
            <CivetHead
              key={i}
              x={h.x}
              y={h.y + (1 - sp) * 260 + bob}
              s={h.s * sp}
              rot={h.rot}
              night={0.15}
              mood={h.mood}
              lookX={h.look}
              blink={blink(t, [EV.civetPop + 1.2 + i * 0.15])}
              brow={h.mood === 'smug' ? 1 : 0}
            />
          );
        })}
      </Layer>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.75}} />
      <IntroCard t={t} tIn={EV.cardIn} tOut={S.end - 0.25} />
    </AbsoluteFill>
  );
};

export const NightRuckus: React.FC<SP> = ({t}) => {
  const S = scene('night');
  const th = EV.thumps;
  const sh = hitShake(t, th, 10);
  const ph = t * 15;
  const local = t - S.start;
  const xa = ip(local, [0, 3.6], [-260, 1340]);
  const xb = ip(local, [0.2, 3.6], [1360, -280]);
  const jump = Math.abs(Math.sin(local * 4.2));
  const lastHit = th.filter((h) => h <= t).pop() ?? -10;
  const toss = Math.exp(-(t - lastHit) * 4) * (t >= lastHit ? 1 : 0);
  const pillowUp = th.length > 2 ? prog(t, th[2], th[2] + 0.35, easeOut) : 0;
  const words = ['ധും!', 'ടപ്പ്!', 'ധും!', 'ക്രീ!', 'ധും!', 'ടപ്പ്!', 'ധും!', 'ടപ്പ്!'];
  return (
    <AbsoluteFill style={{background: '#0c0a14'}}>
      <Cam cx={540} cy={960} z={1} sx={sh.x} sy={sh.y}>
        <Sky id="nr" night={1} t={t} horizon={700} moonX={860} moonY={250} />
        {/* roof cut-away: dark attic triangle */}
        <path d="M -170 950 L 540 250 L 1250 950 Z" fill="#7a2e2a" />
        <path d="M -100 940 L 540 312 L 1180 940 Z" fill="#241712" />
        {[-1, 1].map((d) => (
          <g key={d} stroke="#3e271c" strokeWidth={18}>
            <line x1={540} y1={330} x2={540 + d * 300} y2={940} />
            <line x1={540} y1={330} x2={540 + d * 600} y2={940} />
          </g>
        ))}
        <line x1={300} y1={600} x2={780} y2={600} stroke="#3e271c" strokeWidth={16} />
        <ellipse cx={540} cy={700} rx={420} ry={160} fill="#ffcf6e" opacity={0.06} />
        {/* civets running in the attic */}
        <CivetSide x={xa} y={856} s={0.85} phase={ph} night={0.3} />
        <CivetSide x={xb} y={866} s={0.76} phase={ph + 1.3} night={0.3} flip />
        <CivetSide x={540 + Math.sin(local * 2.1) * 140} y={866 - jump * 110} s={0.7} phase={ph + 2.2} night={0.3} />
        {/* attic floor = bedroom ceiling */}
        <rect x={-120} y={940} width={1320} height={30} fill="#5b3a22" />
        {/* bedroom */}
        <rect x={-120} y={970} width={1320} height={1100} fill="#2c3258" />
        <rect x={-120} y={1296} width={1320} height={800} fill="#20243d" />
        <g>
          <rect x={740} y={1010} width={190} height={210} rx={8} fill="#121a3a" stroke="#4c5480" strokeWidth={10} />
          <circle cx={870} cy={1060} r={30} fill="#fff4d2" opacity={0.85} />
          <line x1={835} y1={1010} x2={835} y2={1220} stroke="#4c5480" strokeWidth={7} />
          <line x1={740} y1={1115} x2={930} y2={1115} stroke="#4c5480" strokeWidth={7} />
        </g>
        <Bed x={430} y={1296} s={0.78} night={0.8} toss={toss} pillowUp={pillowUp} />
        {t < th[0] && (
          <text x={300} y={1110 - (t - S.start) * 40} fontFamily="PoppinsBlack" fontWeight={900} fontSize={56} fill="#c9d2ff" opacity={0.8}>
            Zzz
          </text>
        )}
        {t >= th[0] && t < th[0] + 0.9 && (
          <text x={260} y={1150} fontFamily="PoppinsBlack" fontWeight={900} fontSize={110} fill="#ffd83a" stroke="#000" strokeWidth={8} paintOrder="stroke" transform={`rotate(-10 260 1150)`}>
            !
          </text>
        )}
        {th.map((h, i) => (
          <g key={i}>
            <Dust x={200 + ((i * 263) % 680)} y={972} age={t - h} seed={i} w={260} />
            <Boom x={330 + ((i * 317) % 420)} y={560 + (i % 2) * 90} text={words[i % words.length]} p={(t - h) / 0.55} rot={i % 2 ? 8 : -8} size={70} />
          </g>
        ))}
      </Cam>
    </AbsoluteFill>
  );
};

export const Year2024: React.FC<SP> = ({t}) => {
  const drop = pop(t, EV.cal2024, {damping: 12, stiffness: 140});
  const move = prog(t, EV.podiumIn - 0.1, EV.podiumIn + 0.4, easeInOut);
  const pod = pop(t, EV.podiumIn, {damping: 13, stiffness: 150});
  const bub = pop(t, EV.podiumIn + 0.35, {damping: 11, stiffness: 200});
  const dots = t > EV.podiumIn + 0.4 ? 1 + (Math.floor((t - EV.podiumIn - 0.4) / 0.22) % 3) : 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #fff3d6 0%, #f0cf8f 60%, #c98f4a 100%)'}}>
      <Layer>
        <g opacity={0.12}>
          {Array.from({length: 26}).map((_, i) => (
            <rect key={i} x={-400 + i * 80} y={-200} width={36} height={2400} fill="#a0622d" transform="rotate(18 540 960)" />
          ))}
        </g>
        <ellipse cx={540} cy={1260} rx={380} ry={60} fill="#7a4a20" opacity={0.25 * pod} />
        {pod > 0.001 && (
          <g transform={`translate(0 ${(1 - pod) * 900})`}>
            <Podium x={540} y={1260} s={1.05} />
          </g>
        )}
        {bub > 0.01 && <SpeechBubble x={760} y={700} s={0.95 * bub} dots={dots} />}
      </Layer>
      <Calendar
        pages={[{year: '2024', month: 'ഫെബ്രുവരി'}]}
        flip={0}
        x={lerp(540, 300, move)}
        y={lerp(-760, 330, drop) + move * -40}
        s={lerp(1.05, 0.55, move)}
        rot={lerp(-3, -6, move)}
      />
    </AbsoluteFill>
  );
};

