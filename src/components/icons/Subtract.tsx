import React from 'react';
import { defaultIconColour, defaultIconSize } from './iconDefaults';

interface Props {
  size?: string;
  colour?: string;
}

const Subtract = ({ size, colour }: Props): React.ReactElement => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={{ width: size || defaultIconSize, height: size || defaultIconSize }}
      fill={colour || defaultIconColour}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 13H5v-2h14v2z" />
    </svg>
  );
};

export default Subtract;
