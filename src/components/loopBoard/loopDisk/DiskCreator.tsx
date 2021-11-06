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
  const startX = -defaultRadius;
  const startY = (containerRef.current?.clientWidth || 1) / 2 - defaultRadius;
  const [{ x, y }, api] = useSpring(() => ({
    x: startX,
    y: startY,
  }));

  React.useEffect(() => {
    const sub = timer(10).subscribe(() => {
      console.log('Got it in!');
      const x = -defaultRadius;
      const y = (containerRef.current?.clientWidth || 1) / 2 - defaultRadius;
      api.start({ x, y, immediate: false });
      console.log(containerRef.current?.clientWidth);
    });
    console.log('Trying to subscribe...');

    return () => sub.unsubscribe();
  }, [api, containerRef]);

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    api.start({ x: down ? startX + mx : startX, y: down ? startY + my : startY, immediate: down });

    if (!down) {
      const dim = {
        x: (mx + startX) / (containerRef.current?.clientWidth || 1),
        y: (my + startY) / (containerRef.current?.clientHeight || 1),
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
