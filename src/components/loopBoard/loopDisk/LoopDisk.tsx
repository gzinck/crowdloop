import React from "react";
import styled from "styled-components";
import theme from "../../../theme";
import { getLoopProgress } from "../../../utils/beats";
import { Loop } from "../../LoopContext";
import ClockContext from "../../ClockContext";
import Sector from "./Sector";
import useRefresh from "../../../hooks/useRefresh";
import LoopVis from "./LoopVis";

interface Props {
  loop: Loop | null;
}

const Disk = styled.div`
  width: 90%;
  max-width: 250px;
  padding: ${theme.padding(1)};
  display: flex;
  justify-content: center;
`;

const LoopDisk = (props: Props): React.ReactElement => {
  const clockCtx = React.useContext(ClockContext);
  useRefresh(20); // Keep it up to date

  const currAngle =
    props.loop &&
    getLoopProgress(clockCtx, props.loop).normalized * 2 * Math.PI;

  return (
    <Disk>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={theme.palette.primary.default} />
        {/* Show a vis for the loop's contents */}
        {props.loop && (
          <LoopVis
            radius={50}
            shape={props.loop.content}
            fill={theme.palette.primary.dark}
          />
        )}
        {/* Show the current position in the loop with a circling cursor */}
        {currAngle && (
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
