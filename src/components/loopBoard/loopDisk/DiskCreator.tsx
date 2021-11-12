import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import LoopContext from '../../../contexts/LoopContext';
import theme from '../../../theme';
import useOnResize from '../../../hooks/useOnResize';

interface Props {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const defaultRadius = 100;

const DiskCreator = ({ containerRef }: Props): React.ReactElement => {
  const { recordLoop } = React.useContext(LoopContext);
  const startPos = React.useRef({
    x: -1.5 * defaultRadius,
    y: (containerRef.current?.clientHeight || 1) / 2 - defaultRadius,
  });

  const [{ x, y }, api] = useSpring(() => ({
    x: startPos.current.x,
    y: startPos.current.y,
  }));

  const onResize = () => {
    const x = -1.5 * defaultRadius;
    const y = (containerRef.current?.clientHeight || 1) / 2 - defaultRadius;
    startPos.current = { x, y };
    api.start({ x, y, immediate: true });
  };
  useOnResize(onResize);
  React.useEffect(onResize, [api, containerRef]);

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    const pos = {
      x: Math.max(
        -1.5 * defaultRadius,
        Math.min(
          (containerRef.current?.clientWidth || 1) - defaultRadius / 2,
          startPos.current.x + mx,
        ),
      ),
      y: Math.max(
        -1.5 * defaultRadius,
        Math.min(
          (containerRef.current?.clientHeight || 1) - defaultRadius / 2,
          startPos.current.y + my,
        ),
      ),
    };

    api.start({
      x: down ? pos.x : startPos.current.x,
      y: down ? pos.y : startPos.current.y,
      immediate: down,
    });

    if (!down) {
      // If barely moved, cancel
      if (Math.sqrt(mx * mx + my * my) < defaultRadius) return;

      const normalizedRadius = defaultRadius / (containerRef.current?.clientWidth || 1);
      const clamp = (n: number) =>
        Math.max(-normalizedRadius / 2, Math.min(1 + normalizedRadius / 2, n));

      // Note: (x, y) indicate the center of the circle
      const dim = {
        x: clamp(
          (mx + startPos.current.x + defaultRadius) / (containerRef.current?.clientWidth || 1),
        ),
        y: clamp(
          (my + startPos.current.y + defaultRadius) / (containerRef.current?.clientHeight || 1),
        ),
        radius: normalizedRadius,
      };

      // If out of range, say so
      const isOutOfRange = dim.x < 0 || dim.y < 0 || dim.x > 1 || dim.y > 1;

      recordLoop(!isOutOfRange, dim);
    }
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
        cursor: 'pointer',
        width: `${defaultRadius * 2}px`,
        opacity: 0.5,
      }}
    >
      <div
        style={{
          width: `${defaultRadius * 2}px`,
          height: `${defaultRadius * 2}px`,
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.default,
        }}
      />
    </animated.div>
  );
};

export default DiskCreator;
