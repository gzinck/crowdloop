import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import BarNumIndicator from './BarNumIndicator';
import TimeBarButtons from './TimeBarButtons';

const Bar = styled.div`
  width: 100%;
  height: 5rem;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  background-color: ${theme.palette.primary.default};
  color: ${theme.palette.primary.contrastText};
`;

const TimeBar = (): React.ReactElement => {
  return (
    <Bar>
      <BarNumIndicator />
      <TimeBarButtons />
    </Bar>
  );
};

export default TimeBar;
