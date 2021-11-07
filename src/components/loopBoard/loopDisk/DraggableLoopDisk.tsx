import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import LoopDisk from './LoopDisk';
import LoopContext from '../../../contexts/LoopContext';
import { LoopStatus } from '../../../audio/loopPlayer/loop';
import { CircleDimensions } from '../../../audio/loopPlayer/networkedLoop';
import useOnClickOutside from '../../../hooks/useOnClickOutside';

interface Props {
  loopIdx: number; // turn this into a string when it becomes an id instead
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

enum DragMode {
  MOVE,
  EXPAND,
}

const defaultRadius = 100;

const DraggableLoopDisk = ({ loopIdx, containerRef }: Props): React.ReactElement => {
  // Convert normalized coordinates in [0, 1] to the coordinates in pixels
  const toLocalCoors = React.useCallback(
    (dim: CircleDimensions) => {
      const radius = dim.radius * (containerRef.current?.clientWidth || 1);
      return {
        x: dim.x * (containerRef.current?.clientWidth || 1) - defaultRadius,
        y: dim.y * (containerRef.current?.clientHeight || 1) - defaultRadius,
        radius,
      };
    },
    [containerRef],
  );

  const { loops, deleteLoop } = React.useContext(LoopContext);
  const loop = loops[loopIdx];
  const loopDims = React.useRef(
    loop ? toLocalCoors(loop.dimensions) : { x: 0, y: 0, radius: defaultRadius },
  );

  const [radius, setRadius] = React.useState(loopDims.current.radius);
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  React.useEffect(() => {
    if (loop) {
      loopDims.current = toLocalCoors(loop.dimensions);
      api.start({ ...loopDims.current, immediate: true });
      setRadius(loopDims.current.radius);
    }
  }, [api, loop, toLocalCoors]);

  const discRef = React.useRef(null);
  const [mode, setMode] = React.useState(DragMode.MOVE);
  useOnClickOutside(discRef, () => setMode(() => DragMode.MOVE));

  const bind = useDrag(({ down, tap, movement: [mx, my], delta: [, dy] }) => {
    if (mode === DragMode.MOVE) {
      // Calculate the new normalized position
      const normalizedRadius = defaultRadius / (containerRef.current?.clientWidth || 1);
      const clamp = (n: number) =>
        Math.max(-normalizedRadius / 2, Math.min(1 + normalizedRadius / 2, n));
      const dim = {
        x: clamp(
          (mx + loopDims.current.x + defaultRadius) / (containerRef.current?.clientWidth || 1),
        ),
        y: clamp(
          (my + loopDims.current.y + defaultRadius) / (containerRef.current?.clientHeight || 1),
        ),
        radius: loop?.dimensions.radius || defaultRadius,
      };

      // Start moving the disk the desired distance from the current loop pos
      const localDim = toLocalCoors(dim);
      api.start({ x: localDim.x, y: localDim.y, immediate: down });

      if (!down) {
        loopDims.current = toLocalCoors(dim);
        // At the end, we check if we're out of range
        if (dim.x < 0 || dim.y < 0 || dim.x > 1 || dim.y > 1) {
          // If out of range and we're playing, stop it
          if (loop?.getStatus() === LoopStatus.PLAYING) loop.stop();
          // If we tapped and it was stopped, then start it
          else if (tap && loop?.getStatus() === LoopStatus.STOPPED) {
            loop.start();
            // Move the disc back to its previous location
            loopDims.current = toLocalCoors(loop.dimensions);
            api.start({
              ...toLocalCoors(loop.dimensions),
              immediate: false,
            });
          }
        } else {
          loop?.setDimensions(dim);
          // If it's now in range and it was stopped, start it
          if (loop?.getStatus() === LoopStatus.STOPPED) loop.start();
          // If we tapped, switch modes
          if (tap) setMode(DragMode.EXPAND);
        }
      }
    } else {
      // We are expanding
      setRadius(radius + dy);
      const normalizedRadius = (radius + dy) / (containerRef.current?.clientWidth || 1);
      if (!down) {
        if (normalizedRadius < 0) deleteLoop(loopIdx);
        else {
          loop?.setDimensions({
            ...loop.dimensions,
            radius: normalizedRadius,
          });
        }
        // If we tapped, switch modes
        if (tap) setMode(DragMode.MOVE);
      }
    }
  });

  return (
    <animated.div
      {...bind()}
      ref={discRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        x,
        y,
        touchAction: 'none',
        width: `${defaultRadius * 2}px`,
        opacity: 0.5,
      }}
    >
      <LoopDisk
        loopIdx={loopIdx}
        size="100%"
        halo={`${radius * 2}px`}
        isStatic
        isSelected={mode === DragMode.EXPAND}
      />
    </animated.div>
  );
};

export default DraggableLoopDisk;
