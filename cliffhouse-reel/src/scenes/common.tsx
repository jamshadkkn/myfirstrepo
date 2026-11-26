import React from 'react';
import {AbsoluteFill} from 'remotion';

/** Camera: world point (cx, cy) lands at screen centre, zoomed by z. Optional shake offset. */
export const Cam: React.FC<{cx: number; cy: number; z: number; sx?: number; sy?: number; children: React.ReactNode}> = ({cx, cy, z, sx = 0, sy = 0, children}) => (
  <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${540 - cx * z + sx}px, ${960 - cy * z + sy}px) scale(${z})`}}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

/** Plain full-frame SVG layer (screen space). */
export const Layer: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={style}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

/** Comic sunburst rays. */
export const Rays: React.FC<{rot: number; c1: string; c2: string; cx?: number; cy?: number; n?: number}> = ({rot, c1, c2, cx = 540, cy = 960, n = 18}) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2720} fill={c1} />
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      {Array.from({length: n}).map((_, i) => {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = a0 + Math.PI / n;
        const R = 2400;
        return <path key={i} d={`M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} L ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill={c2} />;
      })}
    </g>
  </g>
);
