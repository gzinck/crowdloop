import React from 'react';

const getWidth = () =>
  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

const getHeight = () =>
  window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

const useOnResize = (handler: (width: number, height: number) => void): void => {
  React.useEffect(() => {
    const listener = () => {
      handler(getWidth(), getHeight());
    };
    window.addEventListener('resize', listener);

    return () => window.removeEventListener('resize', listener);
  }, [handler]);
};

export default useOnResize;
