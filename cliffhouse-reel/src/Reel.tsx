import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import type {ReelProps} from './Root';
import {easeInOut, FPS, SCENES} from './lib/anim';
import {Boss, Establish, NightRuckus, Reveal, Teaser, Year2024} from './scenes/scenes1';
import {EndCard, Finale, GlassScene, Montage, PaperScene, Year2026} from './scenes/scenes2';
import {Captions, ensureFonts, Overlays, SafeArea} from './ui/ui';

ensureFonts();

type Tr = 'cut' | 'iris' | 'fade' | 'whipLeft' | 'whipUp' | 'zoom' | 'flash' | 'dip';

// Transition INTO each scene (beat-sync-editing: a different cut for each story turn).
const TRANS: Record<string, {type: Tr; d: number}> = {
  establish: {type: 'iris', d: 0.4},
  boss: {type: 'cut', d: 0},
  reveal: {type: 'fade', d: 0.24},
  night: {type: 'whipLeft', d: 0.32},
  y2024: {type: 'whipUp', d: 0.32},
  glass: {type: 'dip', d: 0.4},
  y2026: {type: 'flash', d: 0.3},
  paper: {type: 'zoom', d: 0.3},
  montage: {type: 'whipLeft', d: 0.32},
  finale: {type: 'fade', d: 0.35},
  end: {type: 'dip', d: 0.45},
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const incoming = (type: Tr, p: number): React.CSSProperties => {
  const e = easeInOut(clamp01(p));
  const blur = Math.sin(Math.PI * clamp01(p)) * 18;
  switch (type) {
    case 'iris':
      return {clipPath: `circle(${e * 1500}px at 540px 820px)`};
    case 'fade':
      return {opacity: e};
    case 'whipLeft':
      return {transform: `translateX(${(1 - e) * 1080}px)`, filter: `blur(${blur}px)`};
    case 'whipUp':
      return {transform: `translateY(${(1 - e) * 1920}px)`, filter: `blur(${blur}px)`};
    case 'zoom':
      return {opacity: e, transform: `scale(${0.75 + 0.25 * e})`};
    case 'flash':
    case 'cut':
      return {opacity: p < 0.5 ? 0 : 1};
    case 'dip':
      return {opacity: clamp01(p * 2 - 1)};
  }
};

const outgoing = (type: Tr, p: number): React.CSSProperties => {
  const e = easeInOut(clamp01(p));
  const blur = Math.sin(Math.PI * clamp01(p)) * 18;
  switch (type) {
    case 'whipLeft':
      return {transform: `translateX(${-e * 1080}px)`, filter: `blur(${blur}px)`};
    case 'whipUp':
      return {transform: `translateY(${-e * 1920}px)`, filter: `blur(${blur}px)`};
    case 'zoom':
      return {opacity: 1 - e, transform: `scale(${1 + e * 1.5})`};
    case 'flash':
    case 'cut':
      return {opacity: p < 0.5 ? 1 : 0};
    case 'dip':
      return {opacity: 1 - clamp01(p * 2)};
    default:
      return {};
  }
};

const renderScene = (name: string, t: number, handle: string) => {
  switch (name) {
    case 'teaser':
      return <Teaser t={t} />;
    case 'establish':
      return <Establish t={t} />;
    case 'boss':
      return <Boss t={t} />;
    case 'reveal':
      return <Reveal t={t} />;
    case 'night':
      return <NightRuckus t={t} />;
    case 'y2024':
      return <Year2024 t={t} />;
    case 'glass':
      return <GlassScene t={t} />;
    case 'y2026':
      return <Year2026 t={t} />;
    case 'paper':
      return <PaperScene t={t} />;
    case 'montage':
      return <Montage t={t} />;
    case 'finale':
      return <Finale t={t} />;
    case 'end':
      return <EndCard t={t} handle={handle} />;
    default:
      return null;
  }
};

export const Reel: React.FC<ReelProps> = ({showSafeArea, handle}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const layers: React.ReactNode[] = [];
  let flash = 0;
  SCENES.forEach((s, i) => {
    const tin = TRANS[s.name];
    const next = SCENES[i + 1];
    const tout = next ? TRANS[next.name] : undefined;
    const visFrom = s.start - (tin ? tin.d / 2 : 0);
    const visTo = s.end + (tout ? tout.d / 2 : 0);
    if (tin?.type === 'flash') flash = Math.max(flash, 1 - Math.abs(t - s.start) / (tin.d / 2));
    if (t < visFrom || t >= visTo) return;
    let style: React.CSSProperties = {};
    if (tin && tin.d > 0 && t < s.start + tin.d / 2) style = {...style, ...incoming(tin.type, (t - (s.start - tin.d / 2)) / tin.d)};
    if (tout && tout.d > 0 && t >= s.end - tout.d / 2) style = {...style, ...outgoing(tout.type, (t - (s.end - tout.d / 2)) / tout.d)};
    layers.push(
      <AbsoluteFill key={s.name} style={style}>
        {renderScene(s.name, t, handle)}
      </AbsoluteFill>,
    );
  });
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {layers}
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
      <Overlays frame={frame} />
      <Captions t={t} hideLines={['L8', 'L11']} />
      {showSafeArea && <SafeArea />}
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
