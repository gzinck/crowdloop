import React from "react";
import styled from "styled-components";
import theme from "../../../theme";
import Sector from "./Sector";
import useRefresh from "../../../hooks/useRefresh";
import LoopVis from "./LoopVis";
import LoopContext from "../../LoopContext";
import { LoopStatus } from "../../../audio/loopPlayer/loop";

interface Props {
  loopIdx: number;
}

const Disk = styled.div`
  width: 90%;
  max-width: 250px;
  padding: ${theme.padding(1)};
  display: flex;
  justify-content: center;
`;

const LoopDisk = ({ loopIdx }: Props): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);
  const loop = loopCtx.loops[loopIdx];

  useRefresh(20); // Keep it up to date

  const currAngle = loop && loop.buffer.getProgress().normalized * 2 * Math.PI;

  let backgroundColour = theme.palette.background.light;
  if (loop) {
    switch (loop.status) {
      case LoopStatus.PLAYING:
        backgroundColour = theme.palette.primary.default;
        break;
      case LoopStatus.PENDING:
        backgroundColour = theme.palette.recording.pending;
        break;
      case LoopStatus.RECORDING:
        backgroundColour = theme.palette.recording.recording;
    }
  }

  return (
    <Disk onClick={() => loopCtx.recordLoop(loopIdx)}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={backgroundColour} />
        {/* Show a vis for the loop's contents */}
        {loop && (
          <LoopVis
            radius={50}
            shape={loop.buffer.preview}
            fill={theme.palette.primary.dark}
          />
        )}
        {/* Show the current position in the loop with a circling cursor */}
        {currAngle !== null && (
          <Sector
            radius={50}
            angleStart={currAngle}
            angleEnd={currAngle}
            stroke={theme.palette.background.light}
            strokeWidth={2}
          />
        )}
      </svg>
    </Disk>
  );
};

export default LoopDisk;
