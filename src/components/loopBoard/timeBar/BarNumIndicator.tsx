import React from 'react';
import SharedAudioContext from '../../../audio/SharedAudioContext';
import useRefresh from '../../../hooks/useRefresh';
import theme from '../../../theme';
import { getLoopLength, getSecondsUntilStart } from '../../../utils/beats';
import ClockContext from '../../ClockContext';
import Sector from '../loopDisk/Sector';

const BarNumIndicator = (): React.ReactElement => {
  useRefresh(20);
  const time = React.useContext(ClockContext);
  const audio = React.useContext(SharedAudioContext);
  const tts = getSecondsUntilStart(time, audio);
  const length = getLoopLength(time);
  const curAngle = ((length - tts) / length) * 2 * Math.PI;
  return (
    <svg width="3rem" height="3rem" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill={theme.palette.primary.dark} />
      <Sector
        radius={50}
        angleStart={curAngle - 0.3}
        angleEnd={curAngle + 0.3}
        fill={theme.palette.primary.default}
      />
      <circle cx="50" cy="50" r="40" fill={theme.palette.primary.dark} />
      <text fontSize="4rem" x="50%" y="55%" dominantBaseline="middle" textAnchor="middle">
        {time.nBars}
      </text>
    </svg>
  );
};

export default BarNumIndicator;
