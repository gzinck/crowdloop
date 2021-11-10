import React from 'react';
import styled from 'styled-components';
import LoopContext from '../../contexts/LoopContext';
import FlashingBackground from './FlashingBackground';
import IconButton from '../generic/IconButton';
import Add from '../icons/Add';
import LoopDisk from './loopDisk/LoopDisk';
import TimeBar from './timeBar/TimeBar';
import theme from '../../theme';

const Screen = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const LoopBoard = (): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);

  return (
    <Screen>
      <TimeBar />
      <FlashingBackground>
        {Object.values(loopCtx.loops).map((loop) => (
          <LoopDisk loopID={loop.id} key={loop.id} />
        ))}
        <IconButton size="calc(250px - 1rem)" onClick={() => loopCtx.recordLoop()}>
          <Add colour={theme.palette.primary.contrastText} />
        </IconButton>
      </FlashingBackground>
    </Screen>
  );
};

export default LoopBoard;
