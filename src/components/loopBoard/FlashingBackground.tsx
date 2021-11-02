import React from 'react';
import styled from 'styled-components';
import SharedAudioContext from '../../contexts/SharedAudioContext';
import useRefresh from '../../hooks/useRefresh';
import theme from '../../theme';
import { getBeatProgress } from '../../utils/beats';
import ClockContext from '../../contexts/ClockContext';

const Board = styled.div`
  width: 100%;
  padding-top: 5rem;
  min-height: calc(100vh - 5rem);
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
`;

const FlashingBackground = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const audio = React.useContext(SharedAudioContext);
  const time = React.useContext(ClockContext);

  useRefresh(10); // Keep it up to date

  const [beatTime, curBeat] = getBeatProgress(time, audio);

  return (
    <Board
      style={{
        backgroundColor: theme.palette.background.flashing(beatTime, curBeat),
      }}
    >
      {children}
    </Board>
  );
};

export default FlashingBackground;
