import React from 'react';
import Loop from '../audio/loopPlayer/loop';
import SharedAudioContext from '../audio/SharedAudioContext';
import ClockContext from './ClockContext';

interface LoopContextContents {
  loops: (Loop | null)[];
  recordLoop: (idx: number) => void;
}

const defaultContents: LoopContextContents = {
  // @TODO: should we support > 6 loops?
  loops: new Array<Loop | null>(6).fill(null),
  recordLoop: () => null,
};

const LoopContext = React.createContext<LoopContextContents>(defaultContents);

export const LoopContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  // @TODO: add setLoops here to allow changes later on
  const audio = React.useContext(SharedAudioContext);
  const time = React.useContext(ClockContext);
  const [loops, setLoops] = React.useState<(Loop | null)[]>(defaultContents.loops);

  const recordLoop = React.useCallback(
    (idx: number) => {
      setLoops((loops) => {
        const newLoops = [...loops];
        newLoops[idx] = new Loop(audio, time);
        return newLoops;
      });
    },
    [audio, time],
  );

  return (
    <LoopContext.Provider
      value={{
        loops,
        recordLoop,
      }}
    >
      {children}
    </LoopContext.Provider>
  );
};

export default LoopContext;
