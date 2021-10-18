import React from "react";
import styled from "styled-components";
import theme from "../../theme";
import LoopContext from "../LoopContext";
import LoopDisk from "./loopDisk/LoopDisk";

const Board = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${theme.palette.background.default};
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
`;

const LoopBoard = (): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);

  return (
    <Board>
      {loopCtx.loops.map((loop, idx) => (
        <LoopDisk loop={loop} key={idx} />
      ))}
    </Board>
  );
};

export default LoopBoard;
