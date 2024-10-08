import React from 'react';
import { useHistory } from 'react-router';
import { auditTime, Subject, interval } from 'rxjs';
import Cookies from 'js-cookie';
import LimiterNode from 'audio-limiter';
import { GRANT_MIC_ROUTE } from '../routes';
import { RecordingManager } from '../audio/loopRecorder';
import { getMicPermissions, hasMicPermissions } from '../audio/micStream';
import { limiterLookaheadDelay } from '../audio/constants';

const MIC_DELAY_COOKIE = 'mic-delay';

export interface SharedAudioContextContents {
  ctx: AudioContext;
  destination: AudioNode; // In our case, a compressor connected to the ctx destination
  startTime: number; // time when the session started, in seconds
  micDelay: number;
  recorder?: RecordingManager;
  getMicStream: () => void;
  setMicDelay: (s: number) => void;
}

// Singleton design pattern so we don't accidentally make multiple audio contexts
class DefaultContents {
  private static contents?: SharedAudioContextContents;
  public static get(): SharedAudioContextContents {
    if (!DefaultContents.contents) {
      const ctx = new AudioContext();

      // Sound architecture: [NODES] => [compressor] => [limiter] => [destination]
      const limiter = new LimiterNode(ctx, { time: limiterLookaheadDelay });
      limiter.connect(ctx.destination);

      // For old iOS compatability, create the compressor in this gross way
      const compressor = ctx.createDynamicsCompressor();
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.connect(limiter);

      DefaultContents.contents = {
        ctx,
        destination: compressor,
        startTime: 0, // Clock always starts at 0 seconds in audio ctx
        micDelay: 0, // seconds of delay in the mic
        getMicStream: () => null,
        setMicDelay: () => null,
      };
    }

    return DefaultContents.contents;
  }
}

const SharedAudioContext = React.createContext<SharedAudioContextContents>(
  {} as SharedAudioContextContents,
);

export const SharedAudioContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const history = useHistory();
  const [contents, setContents] = React.useState<SharedAudioContextContents>(DefaultContents.get());

  // Subject for setting cookie for mic delay with throttling
  // to avoid too many cookie sets
  const cookie$ = React.useRef(new Subject<number>());
  React.useEffect(() => {
    const sub = cookie$.current.pipe(auditTime(500)).subscribe((s) => {
      Cookies.set(MIC_DELAY_COOKIE, `${s}`);
    });
    return () => sub.unsubscribe();
  }, []);

  const setMicDelay = React.useCallback((s: number) => {
    setContents((contents) => ({
      ...contents,
      micDelay: s,
    }));
    cookie$.current.next(s);
  }, []);

  const getMicStream = React.useCallback(() => {
    return getMicPermissions().then((micStream) => {
      setContents((contents) => {
        contents.ctx.resume();
        // Wait 100ms. If time is not moving, try to resume again
        const sub = interval(100).subscribe(() => {
          if (contents.ctx.currentTime === 0) contents.ctx.resume();
          else sub.unsubscribe();
        });
        return {
          ...contents,
          recorder: new RecordingManager(contents, micStream),
        };
      });
    });
  }, []);

  // Set the mic delay based on the stored cookie, if any
  React.useEffect(() => {
    setMicDelay(+(Cookies.get(MIC_DELAY_COOKIE) || '0'));
  }, [setMicDelay]);

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
