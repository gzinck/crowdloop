import React from 'react';
import SharedAudioContext from '../../../../audio/SharedAudioContext';
import Labelled from '../../../generic/Labelled';
import Slider from '../../../generic/Slider';

const MicDelayChooser = (): React.ReactElement => {
  const { micDelay, setMicDelay } = React.useContext(SharedAudioContext);
  return (
    <Labelled text={`mic delay (${micDelay} s)`}>
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={micDelay}
        onChange={(e) => setMicDelay(+e.target.value)}
        id="mic-delay-slider"
      />
    </Labelled>
  );
};

export default MicDelayChooser;
