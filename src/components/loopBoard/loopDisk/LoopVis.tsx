import React from "react";

const maxNum = 127;
const minNum = 0;

interface Props {
  shape: Float32Array; // Should be numbers in [0, 127]
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  posX?: number; // the center of the circle. Defaults to radius
  posY?: number; // the center of the circle. Defaults to radius
}

const LoopVis = (props: Props): React.ReactElement => {
  const visPath = props.shape.reduce((acc, curr, idx) => {
    const angle = -((idx / props.shape.length) * 2 * Math.PI) + Math.PI / 2;
    const normalizedVal = (curr - minNum) / (maxNum - minNum);
    const x = (0.5 + 0.5 * normalizedVal) * props.radius * Math.cos(angle);
    const y = -(0.5 + 0.5 * normalizedVal) * props.radius * Math.sin(angle);

    // Move to this position if this is the first position, else make the line
    return acc === "" ? `M ${x}, ${y}` : `${acc} L ${x} ${y}`;
  }, "");
  return (
    <g
      transform={`translate(${props.posX || props.radius}, ${
        props.posY || props.radius
      })`}
      stroke={props.stroke || "none"}
      strokeWidth={props.strokeWidth || 0}
    >
      <path d={`${visPath} Z`} fill={props.fill || "none"} />
    </g>
  );
};

export default LoopVis;
