import styled from 'styled-components';
import theme from '../../theme';

const Button = styled.button`
  background-color: ${theme.palette.primary.default};
  color: ${theme.palette.primary.contrastText};
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  margin: 0.3rem;
  border: none;
  font-size: 1rem;
  transition: background-color 0.1s;
  cursor: pointer;
  &:hover {
    background-color: ${theme.palette.primary.light};
  }
  &:disabled {
    cursor: not-allowed;
    background-color: ${theme.palette.primary.dark};
  }
`;

export default Button;
