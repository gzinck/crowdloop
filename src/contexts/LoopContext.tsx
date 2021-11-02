import React from 'react';
import SharedAudioContext from './SharedAudioContext';
import ClockContext from './ClockContext';
import NetworkedLoop from '../audio/loopPlayer/networkedLoop';
import APIContext from './APIContext';

interface LoopContextContents {
  loops: (NetworkedLoop | null)[];
  recordLoop: (idx: number) => void;
}

const defaultContents: LoopContextContents = {
  // @TODO: should we support > 6 loops?
  loops: new Array<NetworkedLoop | null>(6).fill(null),
  recordLoop: () => null,
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
    (idx: number) => {
      setLoops((loops) => {
        const newLoops = [...loops];
        newLoops[idx] = new NetworkedLoop(audio, time, client);
        return newLoops;
      });
    },
    [audio, time, client],
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
