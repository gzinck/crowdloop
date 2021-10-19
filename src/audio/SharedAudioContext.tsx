import React from "react";
import { LoopRecorder } from "./loopRecorderMP3";
import { getMicPermissions, hasMicPermissions } from "./micStream";

export interface SharedAudioContextContents {
  ctx: AudioContext;
  micStream?: MediaStream;
  recorder1?: LoopRecorder;
  recorder2?: LoopRecorder;
  getMicStream: () => void;
}

const defaultContents: SharedAudioContextContents = {
  ctx: new AudioContext(),
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
    getMicPermissions().then((micStream) => {
      setContents((contents) => ({
        ...contents,
        micStream,
        recorder1: new LoopRecorder({ ...contents, micStream }),
        recorder2: new LoopRecorder({ ...contents, micStream }),
      }));
    });
  }, []);

  React.useEffect(() => {
    hasMicPermissions().then((micOK) => {
      // If we already have permission, get the mic's stream.
      if (micOK) getMicStream();
    });
  }, [getMicStream]);

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
