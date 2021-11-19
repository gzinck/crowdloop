import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { createUseGesture, dragAction, scrollAction } from '@use-gesture/react';
import LoopDisk from './LoopDisk';
import LoopContext from '../../../contexts/LoopContext';
import { LoopStatus } from '../../../audio/loopPlayer/loop';
import { CircleDimensions } from '../../../audio/loopPlayer/networkedLoop';

const useGesture = createUseGesture([dragAction, scrollAction]);

interface Props {
  loopID: string; // turn this into a string when it becomes an id instead
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

enum DragMode {
  MOVE,
  EXPAND,
}

const defaultRadius = 100;
const radiusChangeFactor = 2;

const isOff = ({ x, y }: CircleDimensions): boolean => x < 0 || y < 0 || x > 1 || y > 1;

const moveOn = ({ x, y, radius }: CircleDimensions): CircleDimensions => ({
  x: x < 0 ? 0 : x > 1 ? 1 : x,
  y: y < 0 ? 0 : y > 1 ? 1 : y,
  radius,
});

// Moves dimensions to the closest edge
const moveOff = ({ x, y, radius }: CircleDimensions): CircleDimensions => {
  const bestOpt = [
    { x: -0.01, y },
    { x: 1.01, y },
    { x, y: -0.01 },
    { x, y: 1.01 },
  ].reduce<{ x: number; y: number; cost: number }>(
    (best, curr) => {
      const currCost = Math.abs(curr.x - x) + Math.abs(curr.y - y);
      return currCost < best.cost ? { ...curr, cost: currCost } : best;
    },
    { x, y, cost: 100 },
  );

  // Move the position to avoid the disk creator
  if (bestOpt.x === -0.01 && Math.abs(bestOpt.y - 0.5) < 0.1) {
    if (bestOpt.y < 0.5) bestOpt.y = 0.3;
    else bestOpt.y = 0.7;
  }

  return {
    radius,
    x: bestOpt.x,
    y: bestOpt.y,
  };
};

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

  const getNormalizedCoors = React.useCallback(
    (mx: number, my: number) => {
      const normalizedRadius = defaultRadius / (containerRef.current?.clientWidth || 1);
      const clamp = (n: number) =>
        Math.max(-normalizedRadius / 2, Math.min(1 + normalizedRadius / 2, n));
      return {
        x: clamp(
          (mx + loopDims.current.x + defaultRadius) / (containerRef.current?.clientWidth || 1),
        ),
        y: clamp(
          (my + loopDims.current.y + defaultRadius) / (containerRef.current?.clientHeight || 1),
        ),
        radius: loop?.dimensions.radius || defaultRadius,
      };
    },
    [containerRef, loop?.dimensions.radius],
  );

  React.useEffect(() => {
    if (loop) {
      loopDims.current = toLocalCoors(loop.dimensions);
      api.start({ ...loopDims.current, immediate: true });
      setRadius(loopDims.current.radius);
    }
  }, [api, loop, toLocalCoors]);

  const [mode, setMode] = React.useState(DragMode.MOVE);

  // If using iPad, consider using touches to control things
  const bind = useGesture({
    onDrag: ({
      touches,
      metaKey,
      altKey,
      shiftKey,
      ctrlKey,
      movement: [mx, my],
      delta: [, dy],
    }) => {
      // Determine which mode we are in
      let currMode = mode;
      if (
        (touches > 1 || metaKey || altKey || shiftKey || ctrlKey) &&
        currMode !== DragMode.EXPAND
      ) {
        setMode(DragMode.EXPAND);
        currMode = DragMode.EXPAND;
        api.start({ x: loopDims.current.x, y: loopDims.current.y, immediate: false });
      }

      if (currMode === DragMode.MOVE) {
        // Start moving the disk the desired distance from the current loop pos
        const localDim = toLocalCoors(getNormalizedCoors(mx, my));
        api.start({ x: localDim.x, y: localDim.y, immediate: true });
      } else {
        // DragMode.EXPAND
        setRadius(radius + radiusChangeFactor * dy);
      }
    },
    onDragEnd: ({ tap, movement: [mx, my] }) => {
      if (mode === DragMode.MOVE) {
        const dim = getNormalizedCoors(mx, my);
        loopDims.current = toLocalCoors(dim);
        // If we're not out of range, figure out what needs to be done
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
          // If it is not off (out of range)
          loop?.setDimensions(dim);
          // If it's now in range and it was stopped, start it
          if (loop?.getStatus() === LoopStatus.STOPPED) loop.start();
          if (
            [LoopStatus.PENDING, LoopStatus.RECORDING].includes(loop?.getStatus()) &&
            !loop.willStartImmediately()
          )
            loop.start();
          // If we tapped, move off
          if (tap) {
            // setMode(DragMode.EXPAND);
            const offDims = toLocalCoors(moveOff(loop.dimensions));
            api.start({
              ...offDims,
              immediate: false,
            });
            loopDims.current = offDims;
            loop.stop();
          }
        }
      } else {
        // DragMode.EXPAND
        console.log('BYE');
        const normalizedRadius = radius / (containerRef.current?.clientWidth || 1);
        if (normalizedRadius < 0) deleteLoop(loopID);
        else {
          loop?.setDimensions({
            ...loop.dimensions,
            radius: normalizedRadius,
          });
          // Immediately switch back to DragMode.MOVE
          setMode(DragMode.MOVE);
        }
      }
    },
    onScroll: ({ delta: [, dy] }) => {
      // DragMode.EXPAND
      console.log('HELLO');
      setRadius(radius + radiusChangeFactor * dy);
    },
    onScrollEnd: () => {
      const normalizedRadius = radius / (containerRef.current?.clientWidth || 1);
      if (normalizedRadius < 0) deleteLoop(loopID);
      else {
        loop?.setDimensions({
          ...loop.dimensions,
          radius: normalizedRadius,
        });
      }
    },
  });

  return (
    <animated.div
      {...bind()}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        x,
        y,
        touchAction: 'none',
        width: `${defaultRadius * 2}px`,
        cursor: 'pointer',
        opacity: 0.5,
      }}
    >
      <LoopDisk
        loopID={loopID}
        size="100%"
        warning={radius <= 0}
        halo={`${Math.max(radius * 2, 0)}px`}
        isStatic
        isSelected={mode === DragMode.EXPAND}
      />
    </animated.div>
  );
};

export default DraggableLoopDisk;
