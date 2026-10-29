import { forwardRef } from 'react';

/** A little kettle grill. When `lit`, briquettes glow and flames dance. */
const Grill = forwardRef(function Grill({ lit, over, onClick, count }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={`grill${lit ? ' lit' : ''}${over ? ' over' : ''}`}
      onClick={onClick}
      aria-label={lit ? 'The grill is lit — throw another coconut in' : 'Throw the coconut on the grill'}
    >
      <span className="grill-ring" aria-hidden="true" />
      <svg viewBox="0 0 220 200" aria-hidden="true">
        <defs>
          <radialGradient id="grillGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#FFB45C" stopOpacity=".95" />
            <stop offset=".5" stopColor="#F2702A" stopOpacity=".45" />
            <stop offset="1" stopColor="#E2541E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3A322C" /><stop offset="1" stopColor="#141110" />
          </linearGradient>
          <linearGradient id="flameA" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FF6A1F" /><stop offset=".6" stopColor="#FFB14A" /><stop offset="1" stopColor="#FFE6A8" />
          </linearGradient>
        </defs>
        {/* heat glow */}
        <ellipse className="g-glow" cx="110" cy="78" rx="100" ry="70" fill="url(#grillGlow)" />
        {/* flames */}
        <g className="g-flames">
          <path className="fl f1" d="M70 92c-14-20 2-34 10-50 4 16 16 20 14 50z" fill="url(#flameA)" />
          <path className="fl f2" d="M98 94c-18-30 6-52 16-78 6 26 24 34 18 78z" fill="url(#flameA)" />
          <path className="fl f3" d="M136 92c-12-18 2-30 8-44 4 14 14 18 12 44z" fill="url(#flameA)" />
          <path className="fl f4" d="M112 94c-8-14 2-24 6-34 3 10 10 14 8 34z" fill="#FFF1C9" />
        </g>
        {/* briquettes */}
        <g className="g-briq">
          {[[58, 84], [92, 80], [126, 84], [76, 74], [110, 72]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect width="36" height="15" rx="6" fill="#1C1917" />
              <rect className="hotface" x="2" y="2" width="32" height="5" rx="2.5" fill="#2C2824" />
              <ellipse cx="3" cy="7.5" rx="3.5" ry="7" fill="#34302C" />
              <ellipse cx="3" cy="7.5" rx="1.2" ry="2.4" fill="#080706" />
            </g>
          ))}
        </g>
        {/* grate */}
        <g stroke="#6B5A4C" strokeWidth="2.2" strokeLinecap="round">
          <path d="M34 98h152" />
          {[52, 72, 92, 112, 132, 152, 170].map((x) => <path key={x} d={`M${x} 93v10`} />)}
        </g>
        {/* bowl */}
        <path d="M28 100h164c0 40-36 66-82 66S28 140 28 100z" fill="url(#bowl)" stroke="#4A3E35" strokeWidth="1.5" />
        <path d="M44 112c10 26 36 40 66 40" stroke="#5B4B3F" strokeWidth="2" fill="none" opacity=".7" />
        <circle cx="110" cy="140" r="5" fill="#2A231F" stroke="#4A3E35" />
        {/* legs */}
        <g stroke="#2E2723" strokeWidth="5" strokeLinecap="round">
          <path d="M66 158L50 196" /><path d="M154 158L170 196" /><path d="M110 166v30" />
        </g>
      </svg>
      <span className="grill-label">
        {lit ? (<><b>Waste → Warmth!</b><span className="long"> One more shell saved</span></>) : over ? <b>Let go!</b> : <>Drop the coconut here</>}
      </span>
      {typeof count === 'number' && (
        <span className="grill-count"><b>{count.toLocaleString()}</b> coconuts turned to warmth by visitors</span>
      )}
    </button>
  );
});

export default Grill;
