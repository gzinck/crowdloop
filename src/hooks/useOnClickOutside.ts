import React from 'react';

function useOnClickOutside<T extends HTMLElement>(
  ref: React.MutableRefObject<T | null>,
  handler: (event: UIEvent) => void,
): void {
  React.useEffect(() => {
    const listener = (event: UIEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default useOnClickOutside;
