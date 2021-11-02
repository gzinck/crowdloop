import React from 'react';
import styled from 'styled-components';
import theme from '../../../../theme';
import BpbarChooser from './BpbarChooser';
import BPMChooser from './BPMChooser';
import MicDelayChooser from './MicDelayChooser';
import SessionStatus from './SessionStatus';

interface Props {
  isOpen: boolean;
}

const Menu = styled.div`
  display: ${(props: Props) => (props.isOpen ? 'block' : 'none')};
  top: 5rem;
  left: 0;
  padding: 2rem;
  z-index: 1;
  box-sizing: border-box;
  width: calc(min(35rem, 100%));
  background-color: rgba(25, 25, 25, 0.7);
  color: ${theme.palette.background.contrastText};
  position: absolute;
`;

const DropdownMenu = ({ isOpen }: Props): React.ReactElement => {
  return (
    <Menu isOpen={isOpen}>
      <MicDelayChooser />
      <BPMChooser />
      <BpbarChooser />
      <SessionStatus />
    </Menu>
  );
};

export default DropdownMenu;
