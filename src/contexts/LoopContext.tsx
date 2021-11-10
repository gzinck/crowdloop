import React from 'react';
import SharedAudioContext from './SharedAudioContext';
import ClockContext from './ClockContext';
import NetworkedLoop, { CircleDimensions } from '../audio/loopPlayer/networkedLoop';
import APIContext from './APIContext';

interface LoopContextContents {
  loops: Record<string, NetworkedLoop>;
  recordLoop: (dim?: CircleDimensions) => void;
  deleteLoop: (loopID: string) => void;
}

const defaultContents: LoopContextContents = {
  loops: {},
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
  const [loops, setLoops] = React.useState<Record<string, NetworkedLoop>>(defaultContents.loops);

  React.useEffect(() => {
    setLoops((loops) => {
      Object.values(loops).forEach((loop) => loop?.stop());
      return defaultContents.loops;
    });
  }, [client]);

  const recordLoop = React.useCallback(
    (dim?: CircleDimensions) => {
      setLoops((loops) => {
        const newLoop = new NetworkedLoop(audio, time, client, dim);
        const newLoops = { ...loops };
        newLoops[newLoop.id] = newLoop;
        return newLoops;
      });
    },
    [audio, time, client],
  );

  const deleteLoop = React.useCallback((loopID: string) => {
    setLoops((loops) => {
      const newLoops = { ...loops };
      loops[loopID]?.delete();
      delete newLoops[loopID];
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
