import styled from 'styled-components';
import theme from '../../theme';

const Slider = styled.input.attrs({
  type: 'range',
})`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 2rem;
  background: ${theme.palette.background.light};
  outline: none;
  -webkit-filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));
  filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 2rem;
    height: 2rem;
    background: ${theme.palette.primary.default};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 2rem;
    height: 2rem;
    background: ${theme.palette.primary.default};
    cursor: pointer;
  }
`;

export default Slider;
