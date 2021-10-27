import React from 'react';
import styled from 'styled-components';
import SharedAudioContext from '../../../audio/SharedAudioContext';
import theme from '../../../theme';
import Labelled from '../../generic/Labelled';
import Slider from '../../generic/Slider';

const Menu = styled.div`
  padding-top: 5rem;
  background-color: ${theme.palette.background.default};
  color: ${theme.palette.background.contrastText};
`;

const DropdownMenu = (): React.ReactElement => {
  const { micDelay, setMicDelay } = React.useContext(SharedAudioContext);
  return (
    <Menu>
      <Labelled text={`Mic delay (${micDelay} s)`}>
        <Slider
          min={-2}
          max={2}
          step={0.05}
          value={micDelay}
          onChange={(e) => setMicDelay(+e.target.value)}
          id="mic-delay-slider"
        />
      </Labelled>
    </Menu>
  );
};

export default DropdownMenu;
