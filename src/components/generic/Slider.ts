import styled from 'styled-components';
import theme from '../../theme';

const Slider = styled.input.attrs({
  type: 'range',
})`
  -webkit-appearance: none;
  appearance: none;
  border-radius: 1rem;
  width: 100%;
  height: 2rem;
  background: ${theme.palette.background.light};
  outline: none;
  ${theme.shadow.light}

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 5rem;
    height: 2rem;
    background: ${theme.palette.primary.default};
    cursor: pointer;
    border-radius: 1rem;
  }

  &::-moz-range-thumb {
    width: 2rem;
    height: 2rem;
    background: ${theme.palette.primary.default};
    cursor: pointer;
    border-radius: 50%;
  }
`;

export default Slider;
