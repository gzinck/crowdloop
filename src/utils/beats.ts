import { SharedAudioContextContents } from "../audio/SharedAudioContext";
import { TimeSettings } from "../components/ClockContext";

/**
 * Gets the the number of seconds before the loop should start.
 * @param time
 * @param audio the audio context
 * @param minTime the minimum amount of time (in s) before we can start the loop
 * @returns audio context time when the loop should start
 */
export const getSecondsUntilStart = (
  time: TimeSettings,
  audio: SharedAudioContextContents,
  minTime: number = 0
): number => {
  const deltaTime = audio.ctx.currentTime - audio.startTime; // in s
  const loopLength = getLoopLength(time);
  const timeUntilStart = loopLength - (deltaTime % loopLength);
  if (timeUntilStart < minTime) return timeUntilStart + loopLength;
  else return timeUntilStart;
};

/**
 * Gets the length of new loops that get created with the current settings.
 * @param time settings for the loop time
 * @returns number of seconds for the loop
 */
export const getLoopLength = (time: TimeSettings): number => {
  const nBeats = time.bpbar * time.nBars;
  return nBeats / (time.bpm / 60);
};
