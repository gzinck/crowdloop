import React from 'react';
import { useHistory } from 'react-router';
import { GRANT_MIC_ROUTE } from '../routes';
import { RecordingManager } from './loopRecorder';
import { getMicPermissions, hasMicPermissions } from './micStream';

export interface SharedAudioContextContents {
  ctx: AudioContext;
  startTime: number; // time when the session started, in seconds
  micDelay: number;
  recorder?: RecordingManager;
  getMicStream: () => void;
  setMicDelay: (s: number) => void;
}

const defaultContents: SharedAudioContextContents = {
  ctx: new AudioContext(),
  startTime: 0, // Clock always starts at 0 seconds in audio ctx
  micDelay: 0, // seconds of delay in the mic
  getMicStream: () => null,
  setMicDelay: () => null,
};

const SharedAudioContext = React.createContext<SharedAudioContextContents>(defaultContents);

export const SharedAudioContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const history = useHistory();
  const [contents, setContents] = React.useState<SharedAudioContextContents>(defaultContents);

  const setMicDelay = React.useCallback(
    (s: number) =>
      setContents((contents) => ({
        ...contents,
        micDelay: s,
      })),
    [],
  );

  const getMicStream = React.useCallback(() => {
    return getMicPermissions().then((micStream) => {
      setContents((contents) => {
        contents.ctx.resume();
        return {
          ...contents,
          recorder: new RecordingManager(contents, micStream),
        };
      });
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
    if (contents.ctx.state === 'suspended' && history.location.pathname !== '/') {
      history.push(GRANT_MIC_ROUTE);
    }
  }, [contents, history]);

  return (
    <SharedAudioContext.Provider
      value={{
        ...contents,
        getMicStream,
        setMicDelay,
      }}
    >
      {children}
    </SharedAudioContext.Provider>
  );
};

export default SharedAudioContext;
