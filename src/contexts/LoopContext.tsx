import React from 'react';
import SharedAudioContext from './SharedAudioContext';
import ClockContext from './ClockContext';
import NetworkedLoop, { CircleDimensions } from '../audio/loopPlayer/networkedLoop';
import APIContext from './APIContext';

interface LoopContextContents {
  loops: (NetworkedLoop | null)[];
  recordLoop: (dim?: CircleDimensions) => void;
  deleteLoop: (id: number) => void;
}

const defaultContents: LoopContextContents = {
  // @TODO: should we support > 6 loops?
  loops: [],
  recordLoop: () => null,
  deleteLoop: () => null,
};

const LoopContext = React.createContext<LoopContextContents>(defaultContents);

export const LoopContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const audio = React.useContext(SharedAudioContext);
  const time = React.useContext(ClockContext);
  const { client } = React.useContext(APIContext);
  const [loops, setLoops] = React.useState<(NetworkedLoop | null)[]>(defaultContents.loops);

  React.useEffect(() => {
    setLoops((loops) => {
      loops.forEach((loop) => loop?.stop());
      return defaultContents.loops;
    });
  }, [client]);

  const recordLoop = React.useCallback(
    (dim?: CircleDimensions) => {
      setLoops((loops) => [...loops, new NetworkedLoop(audio, time, client, dim)]);
    },
    [audio, time, client],
  );

  const deleteLoop = React.useCallback((idx: number) => {
    setLoops((loops) => {
      const newLoops = [...loops];
      loops[idx]?.delete();
      newLoops.splice(idx, 1);
      return newLoops;
    });
  }, []);

  return (
    <LoopContext.Provider
      value={{
        loops,
        recordLoop,
        deleteLoop,
      }}
    >
      {children}
    </LoopContext.Provider>
  );
};

export default LoopContext;
