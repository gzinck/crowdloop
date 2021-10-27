import React from 'react';
import styled from 'styled-components';
import LoopContext from '../LoopContext';
import FlashingBackground from './FlashingBackground';
import LoopDisk from './loopDisk/LoopDisk';
import TimeBar from './timeBar/TimeBar';

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
        {loopCtx.loops.map((_, idx) => (
          <LoopDisk loopIdx={idx} key={idx} />
        ))}
      </FlashingBackground>
    </Screen>
  );
};

export default LoopBoard;
