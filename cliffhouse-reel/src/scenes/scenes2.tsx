import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CivetHead, CivetSit} from '../art/civet';
import {Palm} from '../art/env';
import {Car, Ceiling, Drop, Nilavilakku, Sparkle, Splash, TableLamp, WaterGlass} from '../art/props';
import {blink, easeInOut, easeOut, EV, ip, lerp, line, pop, prog, scene} from '../lib/anim';
import {Calendar, ML, Newspaper, outline, Stamp} from '../ui/ui';
import {Cam, Layer, Rays} from './common';
import {HouseSet} from './scenes1';

type SP = {t: number};

export const GlassScene: React.FC<SP> = ({t}) => {
  const S = scene('glass');
  const push = prog(t, S.start, EV.peek, easeInOut);
  const z = lerp(1.0, 1.1, push);
  const cy = lerp(1000, 900, push);
  const peek = pop(t, EV.peek, {damping: 13, stiffness: 120});
  const headY = lerp(300, 566, peek);
  const dropX = 588;
  const dropTop = 470;
  const waterY = 1255 - 190;
  const fallDur = 0.42;
  const fallStart = EV.dropHit - fallDur;
  const grow = prog(t, EV.dropForm, fallStart, easeOut);
  let dropY = dropTop + grow * 18;
  let stretch = 1 + grow * 0.25 + Math.sin(t * 30) * 0.03 * grow;
  if (t >= fallStart) {
    const u = (t - fallStart) / fallDur;
    dropY = dropTop + 18 + (waterY - dropTop - 18) * u * u;
    stretch = 1.45;
  }
  const hit = t >= EV.dropHit;
  const tint = prog(t, EV.dropHit + 0.05, EV.dropHit + 0.5, easeOut);
  const shakeK = hit ? Math.exp(-(t - EV.dropHit) * 8) : 0;
  const wink = t > EV.ayye + 0.15 ? 1 - prog(t, EV.ayye + 0.6, EV.ayye + 0.8) : 0;
  return (
    <AbsoluteFill style={{background: '#1d2140'}}>
      <Cam cx={540} cy={cy} z={z} sx={Math.sin(t * 80) * 14 * shakeK} sy={Math.cos(t * 70) * 10 * shakeK}>
        <rect x={-300} y={0} width={1680} height={2200} fill="#2e3460" />
        <g opacity={0.18}>
          {Array.from({length: 14}).map((_, i) => (
            <rect key={i} x={-300 + i * 130} y={430} width={8} height={1000} fill="#1a1d3a" />
          ))}
        </g>
        <TableLamp x={190} y={1258} s={1.15} on={1} />
        <rect x={60} y={1258} width={960} height={36} rx={8} fill="#7b4a26" />
        <rect x={100} y={1294} width={880} height={700} fill="#5e3619" />
        <rect x={130} y={1330} width={820} height={120} rx={10} fill="#6d4021" stroke="#4a2a12" strokeWidth={6} />
        <circle cx={540} cy={1390} r={12} fill="#c9a23a" />
        <WaterGlass x={dropX} y={1258} s={1} tint={tint} ripple={hit ? 1 : 0} rippleT={hit ? t - EV.dropHit : 0} t={t} />
        {t > EV.dropForm && !hit && <Drop x={dropX} y={dropY} s={1.15} stretch={stretch} />}
        <Splash x={dropX} y={waterY - 6} p={(t - EV.dropHit) / 0.55} />
        {/* civet peeking down from the gap; ceiling drawn after so it hides the top of the head */}
        {t > EV.peek - 0.05 && (
          <CivetHead x={432} y={headY} s={1.15} rot={6} night={0.45} mood="grin" lookX={0.5} lookY={0.8} wink={wink} brow={1} blink={blink(t, [EV.peek + 0.9])} />
        )}
        <Ceiling y={456} night={0.7} gapX={505} gap={1.35} />
      </Cam>
      <Stamp t={t} tIn={EV.ayye} tOut={S.end - 0.15} text="അയ്യേ!" top={560} />
    </AbsoluteFill>
  );
};

export const Year2026: React.FC<SP> = ({t}) => {
  const S = scene('y2026');
  const [f0, f1, f2] = EV.calFlips;
  const flip = ip(t, [f0, f0 + 0.16, f1, f1 + 0.16], [0, 1, 1, 2]);
  const sw = prog(t, EV.house2026 - 0.05, EV.house2026 + 0.3, easeInOut);
  const decor = prog(t, EV.house2026 + 0.2, EV.house2026 + 0.7, easeOut);
  const push = prog(t, EV.house2026, S.end + 0.3, easeInOut);
  const chew = (tm: number) => (t > tm && t < tm + 0.5 ? Math.abs(Math.sin((t - tm) * 22)) : 0);
  const chewAll = Math.max(...EV.munch.map(chew));
  return (
    <AbsoluteFill style={{background: '#f3e3c3'}}>
      {sw < 1 && (
        <AbsoluteFill style={{transform: `translateY(${-sw * 1920}px)`, background: 'radial-gradient(ellipse at 50% 40%, #fff3d6 0%, #f0cf8f 60%, #c98f4a 100%)'}}>
          <Calendar
            pages={[
              {year: '2024', month: 'ഫെബ്രുവരി'},
              {year: '2025', month: 'ജൂലൈ'},
              {year: '2026', month: 'മെയ്'},
            ]}
            flip={flip}
            x={540}
            y={430}
            s={1.15}
            rot={-2}
          />
          {t > f2 - 0.05 && (
            <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop(t, f2)})`}}>
              <span style={{fontFamily: ML, fontWeight: 800, fontSize: 70, color: '#c62828', textShadow: outline(5, '#fff', false)}}>പുതിയ സർക്കാർ!</span>
            </div>
          )}
        </AbsoluteFill>
      )}
      {sw > 0 && (
        <AbsoluteFill style={{transform: `translateY(${(1 - sw) * 1920}px)`}}>
          <Cam cx={540} cy={lerp(900, 700, push)} z={lerp(1.0, 1.4, push)}>
            <HouseSet id="y26" t={t} night={0} lit={0} decor={decor} salute={prog(t, EV.house2026 + 0.4, EV.house2026 + 0.7)} />
            <Nilavilakku x={540} y={1192} s={0.42 * decor} t={t} />
            <CivetSit x={415} y={500} s={0.4} prop="popcorn" mood="munch" chew={chewAll} lookX={0.4} lookY={0.6} tailWag={Math.sin(t * 3)} />
            <CivetSit x={665} y={500} s={0.4} prop="popcorn" mood="munch" chew={chewAll * 0.8} lookX={-0.4} lookY={0.6} tailWag={Math.sin(t * 3 + 1)} />
          </Cam>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const PaperScene: React.FC<SP> = ({t}) => {
  const S = scene('paper');
  const L11 = line('L11');
  const words = L11.phrases.flatMap((p) => p.words);
  const hl = words.reduce((acc, w) => acc + Math.max(0, Math.min(1, (t - w.start) / Math.max(0.05, w.end - w.start))), 0) / words.length;
  const spin = prog(t, S.start, EV.paperLand, easeOut);
  const land = pop(t, EV.paperLand, {damping: 9, stiffness: 220});
  const sc = t < EV.paperLand ? lerp(0.06, 0.95, spin) : 0.95 + 0.04 * (1 - land) + prog(t, EV.paperLand, S.end, easeInOut) * 0.03;
  const rot = t < EV.paperLand ? (1 - spin) * 900 : -1.5 * land;
  const wink = t > EV.headlineCivet + 0.15 ? 1 - prog(t, EV.headlineCivet + 0.6, EV.headlineCivet + 0.8) : 0;
  return (
    <AbsoluteFill>
      <Layer>
        <Rays rot={t * 12} c1="#ffb300" c2="#ffca28" cy={900} />
      </Layer>
      <AbsoluteFill style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 290}}>
        <div style={{transform: `rotate(${rot}deg) scale(${sc})`, transformOrigin: '50% 45%'}}>
          <Newspaper hl={hl} wink={wink} t={t} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Montage: React.FC<SP> = ({t}) => {
  const S = scene('montage');
  const local = t - S.start;
  const night = 0.5 - 0.5 * Math.cos((2 * Math.PI * local) / 1.05);
  const years = ['2026', '2031', '2036', '2041', '2046', '2051'];
  const flip = Math.min(years.length - 1, local / 0.42);
  return (
    <AbsoluteFill>
      <Cam cx={540} cy={930} z={1.02}>
        <HouseSet id="mon" t={t} night={night} lit={night} salute={Math.abs(Math.sin(local * 6))} />
        {EV.montageCars.map((tc, i) => {
          const u = (t - tc) / 0.55;
          if (u < 0 || u > 1) return null;
          const dir = i % 2 ? -1 : 1;
          const x = dir > 0 ? lerp(-260, 1340, u) : lerp(1340, -260, u);
          return <Car key={i} x={x} y={1640} s={1.1} flip={dir < 0} night={night} />;
        })}
        <CivetSit x={415} y={500} s={0.4} prop="tea" mood="smug" night={night * 0.6} lookX={0.3} lookY={0.7} />
        <CivetSit x={665} y={500} s={0.4} prop="tea" mood="smug" night={night * 0.6} lookX={-0.3} lookY={0.7} />
      </Cam>
      <Calendar pages={years.map((y) => ({year: y, month: 'മുഖ്യമന്ത്രി'}))} flip={flip} x={880} y={250} s={0.36} rot={4} />
    </AbsoluteFill>
  );
};

export const Finale: React.FC<SP> = ({t}) => {
  const S = scene('finale');
  const z = lerp(1.0, 1.08, prog(t, S.start, S.end, easeInOut));
  const jump = pop(t, EV.banner - 0.05, {damping: 8, stiffness: 180});
  const hop = t > EV.banner - 0.05 ? Math.sin(Math.min(1, (t - EV.banner + 0.05) / 0.35) * Math.PI) * 60 : 0;
  const unfurl = prog(t, EV.banner, EV.banner + 0.45, easeOut);
  const civets = [
    {x: 290, y: 789, s: 0.9, look: 0.3, mood: 'smug' as const},
    {x: 540, y: 765, s: 1.0, look: 0, mood: 'grin' as const},
    {x: 790, y: 789, s: 0.9, look: -0.3, mood: 'smug' as const},
  ];
  return (
    <AbsoluteFill style={{background: '#0b1030'}}>
      <Cam cx={540} cy={960} z={z}>
        <defs>
          <radialGradient id="fin-moon">
            <stop offset="0" stopColor="#fff6da" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="#ffeab0" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ffeab0" stopOpacity="0" />
          </radialGradient>
          <pattern id="fin-tiles" width="76" height="44" patternUnits="userSpaceOnUse">
            <path d="M 0 44 Q 38 8 76 44" stroke="#2c1624" strokeWidth="6" fill="none" />
          </pattern>
          <linearGradient id="fin-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#070d28" />
            <stop offset="1" stopColor="#2a2d66" />
          </linearGradient>
        </defs>
        <rect x={-300} y={-300} width={1680} height={1600} fill="url(#fin-sky)" />
        {Array.from({length: 40}).map((_, i) => (
          <circle key={i} cx={(i * 197) % 1080} cy={(i * 131) % 700} r={2 + (i % 3)} fill="#fff7dc" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />
        ))}
        <circle cx={540} cy={560} r={560} fill="url(#fin-moon)" />
        <circle cx={540} cy={560} r={250} fill="#fff4d2" />
        <circle cx={460} cy={500} r={40} fill="#efe3c0" />
        <circle cx={620} cy={630} r={28} fill="#efe3c0" />
        <circle cx={640} cy={470} r={18} fill="#efe3c0" />
        <Palm x={-30} y={1500} h={1000} lean={90} sway={2 * Math.sin(t * 1.2)} night={1} seed={3} />
        <Palm x={1110} y={1520} h={950} lean={-110} sway={-2 * Math.sin(t * 1.1)} night={1} seed={4} />
        {civets.map((c, i) => (
          <CivetSit
            key={i}
            x={c.x}
            y={c.y - hop * (i === 1 ? 1.2 : 0.8)}
            s={c.s}
            night={0.25}
            mood={t > EV.banner ? 'grin' : c.mood}
            lookX={c.look}
            wink={i === 1 && t > EV.banner + 0.3 ? 1 - prog(t, EV.banner + 1.1, EV.banner + 1.3) : 0}
            blink={blink(t, [S.start + 0.9 + i * 0.2, S.start + 2.6 + i * 0.1])}
            tailWag={Math.sin(t * 2.5 + i)}
            squash={Math.sin(t * 2 + i) * 0.4 + (jump > 0 && jump < 1 ? (1 - jump) * 0.5 : 0)}
          />
        ))}
        {/* roof ridge they sit on */}
        <path d="M -200 1010 L 1280 1010 L 1280 1700 L -200 1700 Z" fill="#4a2638" />
        <path d="M -200 1010 L 1280 1010 L 1280 1700 L -200 1700 Z" fill="url(#fin-tiles)" />
        <rect x={-200} y={990} width={1480} height={36} rx={14} fill="#2c1624" />
        <g transform={`translate(540 1150)`}>
          <g transform={`scale(${unfurl} 1)`} opacity={unfurl > 0 ? 1 : 0}>
            <path d="M -440 -66 L 440 -66 L 400 0 L 440 66 L -440 66 L -400 0 Z" fill="#c62828" stroke="#ffd54f" strokeWidth={6} />
            <text x={0} y={20} textAnchor="middle" fontFamily={ML} fontWeight={800} fontSize={46} fill="#fff3c4">
              ക്ലിഫ് ഹൗസ് · സ്ഥിരം താമസക്കാർ
            </text>
          </g>
        </g>
        {t > EV.banner &&
          [
            [170, 560],
            [910, 590],
            [360, 420],
            [720, 400],
            [540, 300],
          ].map(([x, y], i) => <Sparkle key={i} x={x} y={y} s={0.5 * pop(t, EV.banner + i * 0.07)} rot={t * 60} o={1 - prog(t, EV.banner + 1.2, EV.banner + 1.8)} />)}
      </Cam>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<SP & {handle: string}> = ({t, handle}) => {
  const S = scene('end');
  const head = pop(t, S.start + 0.05, {damping: 9, stiffness: 160});
  const l1 = pop(t, EV.endText, {damping: 12, stiffness: 200});
  const l2 = pop(t, EV.endText + 0.45, {damping: 9, stiffness: 200});
  const foot = prog(t, EV.endText + 0.9, EV.endText + 1.3, easeOut);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 38%, #4a2a6a 0%, #1c1030 60%, #0b0716 100%)'}}>
      <Layer>
        <circle cx={540} cy={620} r={250} fill="#ffd83a" opacity={0.08 + 0.04 * Math.sin(t * 3)} />
        <CivetHead x={540} y={640 - Math.abs(Math.sin(t * 3.2)) * 26 * head} s={1.35 * head} night={0.05} mood="grin" wink={t > EV.endText + 0.6 ? 1 - prog(t, EV.endText + 1.0, EV.endText + 1.15) : 0} brow={1} />
      </Layer>
      <div style={{position: 'absolute', top: 930, left: 40, right: 40, textAlign: 'center'}}>
        <div style={{fontFamily: ML, fontWeight: 800, fontSize: 86, color: '#fff', textShadow: outline(7), transform: `scale(${l1})`, lineHeight: 1.3}}>മുഖ്യമന്ത്രിമാർ മാറും,</div>
        <div style={{fontFamily: ML, fontWeight: 800, fontSize: 104, color: '#FFD83A', textShadow: outline(8), transform: `scale(${l2}) rotate(-2deg)`, lineHeight: 1.3}}>മരപ്പട്ടികൾ മാറില്ല!</div>
        <div style={{marginTop: 40, fontFamily: ML, fontWeight: 700, fontSize: 32, color: '#cbbfe0', opacity: foot, lineHeight: 1.4}}>
          2024 ഫെബ്രുവരി, 2026 മെയ് മാസങ്ങളിലെ
          <br />
          പത്രവാർത്തകളെ ആധാരമാക്കിയ കാർട്ടൂൺ
        </div>
        {handle && <div style={{marginTop: 22, fontFamily: 'PoppinsBlack', fontSize: 40, color: '#fff', opacity: foot}}>{handle}</div>}
      </div>
    </AbsoluteFill>
  );
};

