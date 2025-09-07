import { useEffect } from 'react';

const useOutsideAlerter = (wrapperRef, actionCallback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target) {
        return;
      }

      const target = event.target;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        actionCallback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef, actionCallback]);
};

export default useOutsideAlerter;
