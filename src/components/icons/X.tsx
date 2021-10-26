import React from 'react';
import theme from '../../theme';

const defaultColour = theme.palette.primary.dark;
const defaultSize = '2rem';

interface Props {
  size?: string;
  colour?: string;
}

const X = ({ size, colour }: Props): React.ReactElement => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size || defaultSize}
      viewBox="0 0 24 24"
      width={size || defaultSize}
      fill={colour || defaultColour}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
};

export default X;
