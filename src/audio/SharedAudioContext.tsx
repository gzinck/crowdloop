import React from "react";
import { LoopRecorder } from "./loopRecorder";
import { getMicPermissions, hasMicPermissions } from "./micStream";

export interface SharedAudioContextContents {
  ctx: AudioContext;
  startTime: number; // time when the session started, in seconds
  micStream?: MediaStream;
  recorder1?: LoopRecorder;
  recorder2?: LoopRecorder;
  getMicStream: () => void;
}

const defaultContents: SharedAudioContextContents = {
  ctx: new AudioContext(),
  startTime: 0, // Clock always starts at 0 seconds in audio ctx
  getMicStream: () => null,
};

const SharedAudioContext =
  React.createContext<SharedAudioContextContents>(defaultContents);

export const SharedAudioContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const [contents, setContents] =
    React.useState<SharedAudioContextContents>(defaultContents);

  const getMicStream = React.useCallback(() => {
    return getMicPermissions().then((micStream) => {
      setContents((contents) => ({
        ...contents,
        micStream,
        recorder1: new LoopRecorder({ ...contents, micStream }),
        recorder2: new LoopRecorder({ ...contents, micStream }),
      }));
    });
  }, []);

  // At the start
  React.useEffect(() => {
    hasMicPermissions().then((micOK) => {
      // If we already have permission, get the mic's stream.
      if (micOK) getMicStream();
    });
  }, [getMicStream]);

  // Start the clock right away
  React.useEffect(() => {
    contents.ctx.resume();
  }, [contents]);

  return (
    <SharedAudioContext.Provider
      value={{
        ...contents,
        getMicStream,
      }}
    >
      {children}
    </SharedAudioContext.Provider>
  );
};

export default SharedAudioContext;
