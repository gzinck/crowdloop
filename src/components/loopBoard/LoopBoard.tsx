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

  // React.useEffect(() => {
  //   if (audio.micStream) {
  //     const sub = recordMP3Loop(clockCtx, audio).subscribe({
  //       next: (mp3) => console.log(mp3),
  //       complete: () => console.log("Complete!"),
  //       error: (err) => console.log(err),
  //     });

  //     return () => sub.unsubscribe();
  //   }
  // }, [audio, clockCtx]);

  return (
    <Board>
      {loopCtx.loops.map((_, idx) => (
        <LoopDisk loopIdx={idx} key={idx} />
      ))}
    </Board>
  );
};

export default LoopBoard;
