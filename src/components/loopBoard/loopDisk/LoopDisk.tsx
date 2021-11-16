import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Sector from './Sector';
import useRefresh from '../../../hooks/useRefresh';
import LoopVis from './LoopVis';
import LoopContext from '../../../contexts/LoopContext';
import { LoopStatus } from '../../../audio/loopPlayer/loop';

interface Styles {
  size?: string; // diameter size
  halo?: string; // diameter of the halo
  isSelected?: boolean;
}

interface Props extends Styles {
  loopID: string;
  isStatic?: boolean;
  warning?: boolean;
}

const defaultSize = '250px';
const Disk = styled.div`
  width: ${({ size }: Styles) => size || defaultSize};
  padding: ${theme.padding(1)};
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  position: relative;
`;

const ShadowedSVG = styled.svg`
  -webkit-filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));
  filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));
  width: 100%;
  height: 100%;
  z-index: 3;
`;

const Halo = styled.div.attrs(({ halo, size, isSelected }: Styles) => ({
  style: {
    width: halo || 0,
    height: halo || 0,
    left: `calc((${size || defaultSize} - ${halo || 0}) / 2)`,
    top: `calc((${size || defaultSize} - ${halo || 0}) / 2)`,
    opacity: isSelected ? 1 : 0.4,
  },
}))<Styles>`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background-color: ${theme.palette.background.light};
  z-index: -1;
`;

const LoopDisk = ({
  loopID,
  size,
  isSelected,
  isStatic,
  halo,
  warning,
}: Props): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);
  const loop = loopCtx.loops[loopID];

  useRefresh(20); // Keep it up to date

  const currAngle = loop && loop.getProgress().normalized * 2 * Math.PI;

  let backgroundColour = theme.palette.background.light;
  if (loop) {
    switch (loop.getStatus()) {
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

  const onClick = () => {
    if (!loop) {
      loopCtx.recordLoop(true);
      return;
    }

    switch (loop.getStatus()) {
      case LoopStatus.PLAYING:
        loop.stop();
        break;
      case LoopStatus.STOPPED:
        loop.start();
    }
  };

  return (
    <Disk onClick={isStatic ? undefined : onClick} size={size}>
      <Halo size={size} halo={halo} isSelected={isSelected} />
      <ShadowedSVG viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={backgroundColour} />
        {/* Show a vis for the loop's contents */}
        {loop && (
          <LoopVis
            radius={50}
            shape={loop.getPreview()}
            fill={
              warning
                ? theme.palette.error.default
                : isSelected
                ? theme.palette.primary.light
                : theme.palette.primary.dark
            }
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
      </ShadowedSVG>
    </Disk>
  );
};

export default LoopDisk;
