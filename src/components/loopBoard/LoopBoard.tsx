import React from "react";
import LoopContext from "../LoopContext";
import FlashingBackground from "./FlashingBackground";
import LoopDisk from "./loopDisk/LoopDisk";

const LoopBoard = (): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);

  return (
    <FlashingBackground>
      {loopCtx.loops.map((_, idx) => (
        <LoopDisk loopIdx={idx} key={idx} />
      ))}
    </FlashingBackground>
  );
};

export default LoopBoard;
