import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import IconButton from '../../generic/IconButton';
import Menu from '../../icons/Menu';
import BarNumIndicator from './BarNumIndicator';
import DropdownMenu from './dropdownMenu/DropdownMenu';
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

const TopLeft = styled.div`
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  height: 5rem;
  width: 5rem;
`;

const TimeBar = (): React.ReactElement => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <DropdownMenu isOpen={isOpen} />
      <Bar>
        <TopLeft>
          <IconButton onClick={() => setIsOpen((o) => !o)}>
            <Menu colour={theme.palette.primary.contrastText} />
          </IconButton>
        </TopLeft>
        <BarNumIndicator />
        <TimeBarButtons />
      </Bar>
    </>
  );
};

export default TimeBar;
