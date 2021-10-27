import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Add from '../../icons/Add';
import Subtract from '../../icons/Subtract';

const Button = styled.button`
  border-radius: 50%;
  padding: 1rem;
  border: none;
  margin: 0.5rem;
  background-color: ${theme.palette.primary.dark};
`;

const TimeBarButtons = (): React.ReactElement => {
  return (
    <>
      <Button onClick={() => null}>
        <Subtract colour={theme.palette.primary.contrastText} />
      </Button>
      <Button onClick={() => null}>
        <Add colour={theme.palette.primary.contrastText} />
      </Button>
    </>
  );
};

export default TimeBarButtons;
