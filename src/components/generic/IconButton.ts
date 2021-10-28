import styled from 'styled-components';
import theme from '../../theme';

const IconButton = styled.button`
  border-radius: 50%;
  padding: 1rem;
  border: none;
  height: 4rem;
  width: 4rem;
  margin: 0.5rem;
  background-color: ${theme.palette.primary.dark};
  transition: background-color 0.1s;
  &:hover {
    background-color: ${theme.palette.primary.light};
    cursor: pointer;
  }
`;

export default IconButton;
