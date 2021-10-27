import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import BarNumIndicator from './BarNumIndicator';
import DropdownMenu from './DropdownMenu';
import TimeBarButtons from './TimeBarButtons';

const Bar = styled.div`
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  background-color: ${theme.palette.primary.default};
  color: ${theme.palette.primary.contrastText};
`;

const TimeBar = (): React.ReactElement => {
  return (
    <>
      <Bar>
        <BarNumIndicator />
        <TimeBarButtons />
      </Bar>
      <DropdownMenu />
    </>
  );
};

export default TimeBar;
