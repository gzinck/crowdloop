import styled from 'styled-components';
import theme from '../../theme';

const NumericTextField = styled.input.attrs({
  type: 'number',
  pattern: '[0-9]*',
})`
  background-color: ${theme.palette.primary.default};
  color: ${theme.palette.primary.contrastText};
  width: 100%;
  box-sizing: border-box;
  height: 2rem;
  outline: none;
  border: ${theme.palette.primary.dark};
  border-radius: 1rem;
  padding: 0.2rem 1rem;
  font-size: 1rem;
  ${theme.shadow.light}

  &:focus {
    background-color: ${theme.palette.primary.dark};
  }
`;

export default NumericTextField;
