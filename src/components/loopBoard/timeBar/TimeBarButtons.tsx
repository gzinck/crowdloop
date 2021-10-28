import React from 'react';
import theme from '../../../theme';
import ClockContext from '../../ClockContext';
import Add from '../../icons/Add';
import Subtract from '../../icons/Subtract';
import IconButton from '../../generic/IconButton';

const TimeBarButtons = (): React.ReactElement => {
  const { nBars, updateClock } = React.useContext(ClockContext);

  const addBars = () => updateClock({ nBars: nBars * 2 });
  const removeBars = () => updateClock({ nBars: Math.ceil(nBars / 2) });
  return (
    <>
      <IconButton onClick={removeBars}>
        <Subtract colour={theme.palette.primary.contrastText} />
      </IconButton>
      <IconButton onClick={addBars}>
        <Add colour={theme.palette.primary.contrastText} />
      </IconButton>
    </>
  );
};

export default TimeBarButtons;
