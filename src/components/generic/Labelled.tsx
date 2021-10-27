import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 1rem;
`;

const Label = styled.label`
  display: block;
  padding: 0.5rem;
`;

interface Props {
  text: string;
  children: React.ReactElement;
}

const Labelled = ({ text, children }: Props): React.ReactElement => {
  return (
    <Container>
      <Label htmlFor={children.props.id}>{text}</Label>
      {children}
    </Container>
  );
};

export default Labelled;
