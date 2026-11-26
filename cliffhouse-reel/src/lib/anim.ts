import {Easing, interpolate, interpolateColors, spring} from 'remotion';
import events from '../../public/events.json';
import timeline from '../../public/timeline.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const EV = events.t;
export type SceneName = (typeof events.scenes)[number]['name'];
export const SCENES = events.scenes;
export const scene = (name: string) => SCENES.find((s) => s.name === name)!;
export const LINES = timeline.lines;
export const line = (id: string) => LINES.find((l) => l.id === id)!;

// Easing tokens from the animation-principles skill.
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0..1 progress between two times in seconds, eased and clamped. */
export const prog = (t: number, t0: number, t1: number, ease: (x: number) => number = easeInOut) =>
  t1 <= t0 ? (t >= t1 ? 1 : 0) : interpolate(t, [t0, t1], [0, 1], {...CL, easing: ease});

/** Clamped interpolate over seconds. */
export const ip = (t: number, inR: number[], outR: number[], ease?: (x: number) => number) =>
  interpolate(t, inR, outR, ease ? {...CL, easing: ease} : CL);

/** Spring that starts at time t0 (seconds). Returns 0 before t0. */
export const pop = (t: number, t0: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  t < t0 ? 0 : spring({frame: (t - t0) * FPS, fps: FPS, config: {damping: 11, stiffness: 170, mass: 0.8, ...cfg}});

export const mixc = (a: string, b: string, k: number) => interpolateColors(Math.max(0, Math.min(1, k)), [0, 1], [a, b]);

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Smooth deterministic wobble for hand-held/shake; amp in px. */
export const wobble = (t: number, seed: number, amp: number, speed = 1) =>
  amp * (Math.sin(t * 7.3 * speed + seed) * 0.6 + Math.sin(t * 13.1 * speed + seed * 2.1) * 0.3 + Math.sin(t * 23.7 * speed + seed * 0.7) * 0.1);

/** Shake that decays after each hit time. */
export const hitShake = (t: number, hits: number[], amp: number, decay = 0.18) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const d = t - h;
    if (d >= 0 && d < decay * 4) {
      const e = Math.exp(-d / decay);
      x += Math.sin(d * 90) * amp * e;
      y += Math.cos(d * 77) * amp * e * 0.7;
    }
  }
  return {x, y};
};

/** Simple 0..1 blink: closed briefly around each time. */
export const blink = (t: number, times: number[], dur = 0.14) => {
  for (const b of times) {
    const d = t - b;
    if (d >= 0 && d < dur) return 1 - Math.abs(d / dur - 0.5) * 2;
  }
  return 0;
};
