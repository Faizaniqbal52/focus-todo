import { useEffect, useRef, useState } from 'react';

// Smoothly counts a number up to its target with an ease-out curve. Used for the
// headline metrics so the command center feels alive on load and on data change.
export default function useCountUp(target, { duration = 900 } = {}) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(target) || 0;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (from === to || reduced || typeof requestAnimationFrame === 'undefined') {
      fromRef.current = to;
      setValue(to);
      return undefined;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = from + (to - from) * eased;
      setValue(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}
