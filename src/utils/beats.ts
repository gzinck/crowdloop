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

/**
 * Gets how far into the current beat we are, normalized to [0, 1).
 * @param time settings for the global time context
 * @param audio the audio context we are working in
 * @returns [beatProgress, beatNum] where beatProgress is in [0, 1) and
 * beatNum is 0 indexed relative to the loop length
 */
export const getBeatProgress = (time: TimeSettings, audio: SharedAudioContextContents): [number, number] => {
  const deltaTime = audio.ctx.currentTime - audio.startTime; // in s
  const beat = deltaTime * (time.bpm / 60);
  return [beat % 1, Math.floor(beat % time.bpbar)];
};
