import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import LoopContext from '../../../contexts/LoopContext';
import { timer } from 'rxjs';
import theme from '../../../theme';

interface Props {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const defaultRadius = 100;

const DiskCreator = ({ containerRef }: Props): React.ReactElement => {
  const { recordLoop } = React.useContext(LoopContext);
  const startX = -1.5 * defaultRadius;
  const startY = (containerRef.current?.clientHeight || 1) / 2 - defaultRadius;
  const [{ x, y }, api] = useSpring(() => ({
    x: startX,
    y: startY,
  }));

  // After render, move it in
  React.useEffect(() => {
    const sub = timer(10).subscribe(() => {
      const x = -1.5 * defaultRadius;
      const y = (containerRef.current?.clientHeight || 1) / 2 - defaultRadius;
      api.start({ x, y, immediate: false });
    });

    return () => sub.unsubscribe();
  }, [api, containerRef]);

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    api.start({ x: down ? startX + mx : startX, y: down ? startY + my : startY, immediate: down });

    if (!down) {
      // Note: (x, y) indicate the center of the circle
      const dim = {
        x: (mx + startX + defaultRadius) / (containerRef.current?.clientWidth || 1),
        y: (my + startY + defaultRadius) / (containerRef.current?.clientHeight || 1),
        radius: defaultRadius / (containerRef.current?.clientWidth || 1),
      };
      // If out of range, we're done
      if (dim.x < 0 || dim.y < 0 || dim.x > 1 || dim.y > 1) return;

      recordLoop(dim);
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
