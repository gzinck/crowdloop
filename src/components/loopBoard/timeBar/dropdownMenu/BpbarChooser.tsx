import React from 'react';
import Labelled from '../../../generic/Labelled';
import NumericTextField from '../../../generic/NumericTextField';
import ClockContext from '../../../../contexts/ClockContext';

const BpbarChooser = (): React.ReactElement => {
  const { bpbar, updateClock } = React.useContext(ClockContext);
  const [curBpbar, updateCurBpbar] = React.useState(bpbar);
  return (
    <Labelled text={`beats`}>
      <NumericTextField
        id="bpbar-selector"
        value={curBpbar}
        onChange={(e) => {
          const bpbar = +e.target.value;
          updateCurBpbar(bpbar);
          if (bpbar > 0) updateClock({ bpbar });
        }}
      />
    </Labelled>
  );
};

export default BpbarChooser;
