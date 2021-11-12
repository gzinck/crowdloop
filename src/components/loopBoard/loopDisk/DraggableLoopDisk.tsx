import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import LoopDisk from './LoopDisk';
import LoopContext from '../../../contexts/LoopContext';
import { LoopStatus } from '../../../audio/loopPlayer/loop';
import { CircleDimensions } from '../../../audio/loopPlayer/networkedLoop';
import useOnClickOutside from '../../../hooks/useOnClickOutside';

interface Props {
  loopID: string; // turn this into a string when it becomes an id instead
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

enum DragMode {
  MOVE,
  EXPAND,
}

const defaultRadius = 100;

const isOff = ({ x, y }: CircleDimensions): boolean => x < 0 || y < 0 || x > 1 || y > 1;

const moveOn = ({ x, y, radius }: CircleDimensions): CircleDimensions => ({
  x: x < 0 ? 0 : x > 1 ? 1 : x,
  y: y < 0 ? 0 : y > 1 ? 1 : y,
  radius,
});

// // Moves dimensions to the closest edge
// const moveAway = ({ x, y, radius }: CircleDimensions): CircleDimensions => {
//   const bestOpt = [
//     { x: 0, y },
//     { x: 1, y },
//     { x, y: 0 },
//     { x, y: 1 },
//   ].reduce<{ x: number; y: number; cost: number }>(
//     (best, curr) => {
//       const currCost = Math.abs(curr.x - x) + Math.abs(curr.y - y);
//       return currCost < best.cost ? { ...curr, cost: currCost } : best;
//     },
//     { x, y, cost: 100 },
//   );
//   return {
//     radius,
//     x: bestOpt.x,
//     y: bestOpt.y,
//   };
// };

const DraggableLoopDisk = ({ loopID, containerRef }: Props): React.ReactElement => {
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
  const loop = loops[loopID];
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

  // If using iPad, consider using touches to control things
  const bind = useDrag(({ tap, touches, shiftKey, down, movement: [mx, my], delta: [, dy] }) => {
    let currMode = mode;
    if (touches > 1 || shiftKey) {
      setMode(DragMode.EXPAND);
      currMode = DragMode.EXPAND;

      api.start({ x: loopDims.current.x, y: loopDims.current.y, immediate: false });
    }
    if (currMode === DragMode.MOVE) {
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
        if (isOff(dim)) {
          // If we didn't tap, stop it
          if (!tap) loop.stop();
          // If we tapped and it was stopped, then start it
          else if (
            [LoopStatus.PENDING, LoopStatus.STOPPED, LoopStatus.RECORDING].includes(
              loop?.getStatus(),
            )
          ) {
            loop.start();
            // Move the disc back to its previous location
            // But if it was always off, move it on
            if (isOff(loop.dimensions)) loop.setDimensions(moveOn(loop.dimensions));

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
          if (
            [LoopStatus.PENDING, LoopStatus.RECORDING].includes(loop?.getStatus()) &&
            !loop.willStartImmediately()
          )
            loop.start();
          // If we tapped, switch modes
          if (tap) setMode(DragMode.EXPAND);
        }
      }
    } else {
      // We are expanding
      setRadius(radius + dy);
      const normalizedRadius = (radius + dy) / (containerRef.current?.clientWidth || 1);
      if (!down) {
        if (normalizedRadius < 0) deleteLoop(loopID);
        else {
          loop?.setDimensions({
            ...loop.dimensions,
            radius: normalizedRadius,
          });
          // Immediately switch back to move mode
          setMode(DragMode.MOVE);
        }
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
        loopID={loopID}
        size="100%"
        halo={`${radius * 2}px`}
        isStatic
        isSelected={mode === DragMode.EXPAND}
      />
    </animated.div>
  );
};

export default DraggableLoopDisk;
