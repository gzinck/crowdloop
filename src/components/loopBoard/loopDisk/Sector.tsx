import React from 'react';

interface Props {
  radius: number;
  angleStart: number; // in radians, clockwise from north
  angleEnd: number; // in radians, clockwise from north
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  posX?: number; // the center of the circle. Defaults to radius
  posY?: number; // the center of the circle. Defaults to radius
}

const Sector = (props: Props): React.ReactElement => {
  // Transform angles to work with unit circle
  const angleStart = -props.angleStart + Math.PI / 2;
  const angleEnd = -props.angleEnd + Math.PI / 2;

  const startX = props.radius * Math.cos(angleStart);
  const startY = -props.radius * Math.sin(angleStart);
  const endX = props.radius * Math.cos(angleEnd);
  const endY = -props.radius * Math.sin(angleEnd);

  const bigArc = (props.angleEnd - props.angleStart) % (2 * Math.PI) > Math.PI ? 1 : 0;

  return (
    <g
      transform={`translate(${props.posX || props.radius}, ${props.posY || props.radius})`}
      stroke={props.stroke || 'none'}
      strokeWidth={props.strokeWidth || 0}
    >
      <path
        d={`M 0,0 L ${startX} ${startY} A ${props.radius} ${props.radius} 0 ${bigArc} 1 ${endX} ${endY} Z`}
        fill={props.fill || 'none'}
      />
    </g>
  );
};

export default Sector;
