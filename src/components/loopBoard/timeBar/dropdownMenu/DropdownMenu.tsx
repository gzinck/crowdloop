import React, { MutableRefObject } from 'react';
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
  color: ${theme.palette.background.contrastText};
  position: absolute;
`;

const Backdrop = styled.div`
  display: ${(props: Props) => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  top: 5rem;
  left: 0;
  width: 100%;
  height: calc(100% - 5rem);
  z-index: 1;
  background-color: rgba(25, 25, 25, 0.7);
  backdrop-filter: blur(5px);
`;

const DropdownMenu = (
  { isOpen }: Props,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.ReactElement => {
  return (
    <>
      <Backdrop isOpen={isOpen} />
      <Menu isOpen={isOpen} ref={ref as MutableRefObject<HTMLDivElement>}>
        <MicDelayChooser />
        <BPMChooser />
        <BpbarChooser />
        <SessionStatus />
      </Menu>
    </>
  );
};

export default React.forwardRef(DropdownMenu);
