import React from "react";

enum LoopStatus {
  PLAYING = "PLAYING",
  STOPPED = "STOPPED",
  RECORDING = "RECORDING",
}

export interface Loop {
  nBeats: number; // number of beats in the loop
  status: LoopStatus;
  content: Float32Array;
}

interface LoopContextContents {
  loops: (Loop | null)[];
}

const defaultContents: LoopContextContents = {
  // @TODO: should we support > 6 loops?
  loops: new Array<Loop | null>(6).fill(null),
};

// #TODO: remove this temporary loop demo
defaultContents.loops[0] = {
  nBeats: 16,
  status: LoopStatus.PLAYING,
  content: new Float32Array([0, 50, 127, 50, 120, 50, 120]),
};

defaultContents.loops[1] = {
  nBeats: 6,
  status: LoopStatus.PLAYING,
  content: new Float32Array([0, 50, 127, 2, 120, 5, 9]),
};

const LoopContext = React.createContext<LoopContextContents>(defaultContents);

export const LoopContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  // @TODO: add setLoops here to allow changes later on
  const [loops] = React.useState<(Loop | null)[]>(
    defaultContents.loops
  );

  return (
    <LoopContext.Provider
      value={{
        loops,
      }}
    >
      {children}
    </LoopContext.Provider>
  );
};

export default LoopContext;
