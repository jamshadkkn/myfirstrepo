import React from 'react';
import {Composition} from 'remotion';
import {z} from 'zod';
import {Reel} from './Reel';
import events from '../public/events.json';

export const reelSchema = z.object({
  // Draws the 9:16 Reels safe area on top, for checking layout. Off for the real render.
  showSafeArea: z.boolean(),
  // Optional page handle shown on the end card, e.g. "@yourpage". Empty = hidden.
  handle: z.string(),
});

export type ReelProps = z.infer<typeof reelSchema>;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CliffHouseReel"
    component={Reel}
    durationInFrames={events.durationInFrames}
    fps={30}
    width={1080}
    height={1920}
    schema={reelSchema}
    defaultProps={{showSafeArea: false, handle: ''}}
  />
);

