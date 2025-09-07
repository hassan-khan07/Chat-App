// This hook is used to debounce a value.
// It will only update the value after a certain amount of time has passed since the last update.
// This is useful for preventing expensive operations from being triggered too frequently,
// such as sending a "typing" event on every keystroke.

import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;