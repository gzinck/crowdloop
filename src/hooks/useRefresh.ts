import React from 'react';

const useRefresh = (ms: number): void => {
  const [, setCtr] = React.useState(0);
  React.useEffect(() => {
    const sub = setInterval(() => {
      setCtr((ctr) => ctr + 1);
    }, ms);

    return () => clearInterval(sub);
  }, [ms]);
};

export default useRefresh;
