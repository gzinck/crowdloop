import { TimeSettings } from "../components/ClockContext";
import { Loop } from "../components/LoopContext";

interface LoopProgress {
  normalized: number; // in [0, 1)
  time: number; // curr time in the loop
  beats: number; // current beat in the loop (float)
}

// Gets the position of the loop
export const getLoopProgress = (
  time: TimeSettings,
  loop: Loop
): LoopProgress => {
  const deltaTime = performance.now() - time.startTime; // in ms
  const beatsSinceStart = (deltaTime / 1000) * (time.bpm / 60);
  const beats = beatsSinceStart % loop.nBeats;
  return {
    normalized: beats / loop.nBeats,
    time: beats / (time.bpm / 60),
    beats,
  };
};
