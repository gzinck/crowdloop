import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';

const Bar = styled.div`
  width: 100%;
  height: 3rem;
  background-color: ${theme.palette.primary.default};
  color: ${theme.palette.primary.contrastText};
`;

const TimeBar = (): React.ReactElement => {
  return <Bar>This is a time bar</Bar>;
};

export default TimeBar;
