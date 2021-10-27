import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import ClockContext from '../../ClockContext';
import Add from '../../icons/Add';
import Subtract from '../../icons/Subtract';

const Button = styled.button`
  border-radius: 50%;
  padding: 1rem;
  border: none;
  height: 4rem;
  width: 4rem;
  margin: 0.5rem;
  background-color: ${theme.palette.primary.dark};
  transition: background-color 0.1s;
  &:hover {
    background-color: ${theme.palette.primary.light};
    cursor: pointer;
  }
`;

const TimeBarButtons = (): React.ReactElement => {
  const { nBars, updateClock } = React.useContext(ClockContext);

  const addBars = () => updateClock({ nBars: nBars * 2 });
  const removeBars = () => updateClock({ nBars: Math.ceil(nBars / 2) });
  return (
    <>
      <Button onClick={removeBars}>
        <Subtract colour={theme.palette.primary.contrastText} />
      </Button>
      <Button onClick={addBars}>
        <Add colour={theme.palette.primary.contrastText} />
      </Button>
    </>
  );
};

export default TimeBarButtons;
