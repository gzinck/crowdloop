import React from 'react';
import styled from 'styled-components';
import LoopContext from '../../contexts/LoopContext';
import FlashingBackground from './FlashingBackground';
import DiskCreator from './loopDisk/DiskCreator';
import DraggableLoopDisk from './loopDisk/DraggableLoopDisk';
import RoomBox from './roomBox/RoomBox';
import TimeBar from './timeBar/TimeBar';

const Screen = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const SessionPage = (): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);
  const boxContainer = React.useRef(null);

  return (
    <Screen>
      <TimeBar />
      <FlashingBackground>
        <RoomBox ref={boxContainer}>
          {loopCtx.loops.map((_, idx) => (
            <DraggableLoopDisk loopIdx={idx} key={idx} containerRef={boxContainer} />
          ))}
          <DiskCreator containerRef={boxContainer} />
        </RoomBox>
      </FlashingBackground>
    </Screen>
  );
};

export default SessionPage;
