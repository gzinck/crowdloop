import React from 'react';
import SharedAudioContext from './SharedAudioContext';
import ClockContext from './ClockContext';
import NetworkedLoop, { CircleDimensions } from '../audio/loopPlayer/networkedLoop';
import APIContext from './APIContext';
import Logger, { LogType } from '../utils/Logger';

interface LoopContextContents {
  loops: Record<string, NetworkedLoop>;
  recordLoop: (startImmediately: boolean, dim?: CircleDimensions) => void;
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
    (startImmediately: boolean, dim?: CircleDimensions) => {
      setLoops((loops) => {
        try {
          const newLoop = new NetworkedLoop(audio, time, startImmediately, client, dim);
          const newLoops = { ...loops };
          newLoops[newLoop.id] = newLoop;
          return newLoops;
        } catch (err) {
          Logger.error(`${err}`, LogType.RECORD);
          return loops;
        }
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
