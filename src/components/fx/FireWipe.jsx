import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion } from '../../lib/fx.js';

/** On every page change, a sheet of darkness burns away downward with a glowing fire edge. */
export default function FireWipe() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (prefersReducedMotion()) return;
    setRun((n) => n + 1);
  }, [pathname]);

  if (!run) return null;
  return (
    <div key={run} className="fire-wipe" aria-hidden="true">
      <div className="fw-sheet" />
      <div className="fw-edge" />
    </div>
  );
}
