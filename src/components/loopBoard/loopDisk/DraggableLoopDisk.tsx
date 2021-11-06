import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import LoopDisk from './LoopDisk';
import LoopContext from '../../../contexts/LoopContext';
import { LoopStatus } from '../../../audio/loopPlayer/loop';
import { CircleDimensions } from '../../../audio/loopPlayer/networkedLoop';

interface Props {
  loopIdx: number; // turn this into a string when it becomes an id instead
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const defaultRadius = 100;

const DraggableLoopDisk = ({ loopIdx, containerRef }: Props): React.ReactElement => {
  const toLocalCoors = React.useCallback(
    (dim: CircleDimensions) => {
      const radius = dim.radius * (containerRef.current?.clientWidth || 1);
      return {
        x: dim.x * (containerRef.current?.clientWidth || 1) - radius,
        y: dim.y * (containerRef.current?.clientHeight || 1) - radius,
        radius,
      };
    },
    [containerRef],
  );

  const { loops } = React.useContext(LoopContext);
  const loop = loops[loopIdx];
  const initialDim = loop ? toLocalCoors(loop.dimensions) : { x: 0, y: 0, radius: defaultRadius };

  // FOR NOW, radius is constant. Later, we will change this.
  const radius = initialDim.radius;
  const [{ x, y }, api] = useSpring(() => ({ x: initialDim.x, y: initialDim.y }));

  const bindRoot = useDrag(
    ({ down, tap, movement: [mx, my], lastOffset: [ix, iy] }) => {
      api.start({ x: mx + ix, y: my + iy, immediate: down });

      const dim = {
        x: (mx + ix + radius) / (containerRef.current?.clientWidth || 1),
        y: (my + iy + radius) / (containerRef.current?.clientHeight || 1),
        radius: defaultRadius / (containerRef.current?.clientWidth || 1),
      };

      if (!down) {
        // At the end, we check if we're out of range
        if (dim.x < 0 || dim.y < 0 || dim.x > 1 || dim.y > 1) {
          // If out of range and we're playing, stop it
          if (loop?.getStatus() === LoopStatus.PLAYING) loop.stop();
          // If we tapped and it was stopped, then start it
          else if (tap && loop?.getStatus() === LoopStatus.STOPPED) {
            loop.start();
            // Move the disc back to its previous location
            api.start({
              ...toLocalCoors(loop.dimensions),
              immediate: false,
            });
          }
        } else {
          // If it's now in range and it was stopped, start it
          if (loop?.getStatus() === LoopStatus.STOPPED) loop.start();
          loop?.setDimensions(dim);
        }
      }
    },
    {
      bounds: {
        left: -2 * radius,
        right: containerRef.current?.clientWidth,
        top: -2 * radius,
        bottom: containerRef.current?.clientHeight,
      },
    },
  );
  return (
    <animated.div
      {...bindRoot()}
      style={{
        position: 'absolute',
        x,
        y,
        touchAction: 'none',
        width: `${radius * 2}px`,
        opacity: 0.5,
      }}
    >
      <LoopDisk loopIdx={loopIdx} size="100%" isStatic />
    </animated.div>
  );
};

export default DraggableLoopDisk;
