import styled from 'styled-components';
import theme from '../../theme';

interface Styles {
  size?: string;
  padding?: string;
}

const IconButton = styled.button.attrs((styles: Styles) => ({
  style: {
    height: styles.size || '4rem',
    width: styles.size || '4rem',
    padding: styles.padding || 0,
  },
}))<Styles>`
  border-radius: 50%;
  padding: 1rem;
  border: none;
  box-sizing: border-box;
  margin: 0.5rem;
  background-color: ${theme.palette.primary.depressed};
  transition: background-color 0.1s;
  ${theme.shadow.light}
  &:hover {
    background-color: ${theme.palette.primary.light};
    cursor: pointer;
    ${theme.shadow.default}
  }
`;

export default IconButton;
