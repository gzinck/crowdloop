import React from 'react';
import { defaultIconColour, defaultIconSize } from './iconDefaults';

interface Props {
  size?: string;
  colour?: string;
}

const Add = ({ size, colour }: Props): React.ReactElement => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size || defaultIconSize}
      viewBox="0 0 24 24"
      width={size || defaultIconSize}
      fill={colour || defaultIconColour}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
};

export default Add;
