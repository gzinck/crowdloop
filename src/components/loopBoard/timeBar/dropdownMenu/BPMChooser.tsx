import React from 'react';
import Labelled from '../../../generic/Labelled';
import NumericTextField from '../../../generic/NumericTextField';
import ClockContext from '../../../../contexts/ClockContext';

const BPMChooser = (): React.ReactElement => {
  const { bpm, updateClock } = React.useContext(ClockContext);
  const [curBPM, updateCurBPM] = React.useState(bpm);
  return (
    <Labelled text={`bpm`}>
      <NumericTextField
        id="bpm-selector"
        value={curBPM}
        onChange={(e) => {
          const bpm = +e.target.value;
          updateCurBPM(bpm);
          if (bpm > 0) updateClock({ bpm: bpm });
        }}
      />
    </Labelled>
  );
};

export default BPMChooser;
