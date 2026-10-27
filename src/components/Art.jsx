import { useId } from 'react';

// Hand-drawn coconut used by the draggable toy and the process strip.
export function CoconutArt({ className }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <radialGradient id={`cg${id}`} cx="34%" cy="28%" r="78%">
          <stop offset="0" stopColor="#A86C43" />
          <stop offset=".5" stopColor="#704428" />
          <stop offset="1" stopColor="#3A2214" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="84" rx="70" ry="68" fill={`url(#cg${id})`} />
      <g stroke="#C9935F" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".45">
        <path d="M22 60 Q40 40 60 28" /><path d="M17 82 Q38 55 72 36" /><path d="M22 106 Q48 72 92 50" />
        <path d="M38 130 Q70 100 116 72" /><path d="M64 148 Q100 122 138 94" /><path d="M100 148 Q126 130 148 108" />
      </g>
      <g stroke="#2A170C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".55">
        <path d="M30 70 l-7 -3" /><path d="M50 122 l-5 5" /><path d="M122 58 l6 -5" />
        <path d="M132 114 l7 3" /><path d="M92 142 l2 7" /><path d="M110 40 l4 -6" />
      </g>
      <ellipse cx="68" cy="34" rx="7" ry="8" fill="#24130A" />
      <ellipse cx="91" cy="34" rx="7" ry="8" fill="#24130A" />
      <ellipse cx="79.5" cy="52" rx="7" ry="8" fill="#24130A" />
      <ellipse cx="52" cy="44" rx="22" ry="11" fill="#fff" opacity=".14" transform="rotate(-30 52 44)" />
    </svg>
  );
}

// ALAB briquette: a solid cylinder with a center air hole.
export function BriquetteArt({ size = 110, glow = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={glow ? { filter: 'drop-shadow(0 0 22px rgba(242,140,56,.35))' } : undefined}>
      <g transform="rotate(-28 60 60)">
        <rect x="26" y="40" width="84" height="40" rx="10" fill="#1A1715" />
        <rect x="30" y="44" width="76" height="8" rx="4" fill="#2C2824" />
        <g fill="#3A342F" opacity=".7">
          <circle cx="50" cy="66" r="1.4" /><circle cx="66" cy="58" r="1.1" /><circle cx="82" cy="70" r="1.5" />
          <circle cx="94" cy="56" r="1" /><circle cx="58" cy="74" r="1" /><circle cx="74" cy="48" r="1.2" />
        </g>
        <ellipse cx="27" cy="60" rx="11" ry="20" fill="#34302C" />
        <ellipse cx="27" cy="60" rx="8.5" ry="16.5" fill="#29251F" />
        <ellipse cx="27" cy="60" rx="3.6" ry="6.4" fill="#080706" />
      </g>
    </svg>
  );
}

export function DrumArt() {
  return (
    <svg width="104" height="124" viewBox="0 0 110 130" aria-hidden="true">
      <rect x="15" y="20" width="80" height="104" rx="10" fill="#2A2420" stroke="#4A3E35" strokeWidth="2" />
      <rect x="10" y="12" width="90" height="14" rx="5" fill="#3A322B" />
      <ellipse cx="55" cy="100" rx="30" ry="12" fill="#F28C38" opacity=".55" />
      <path d="M45 104c-6-12 4-20 10-30 3 10 12 14 8 30z" fill="#F7A23B" />
    </svg>
  );
}

export function MoldArt() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="88" rx="50" ry="16" fill="#1F1A17" />
      <path d="M14 60h92l-8 30H22z" fill="#2E2723" stroke="#4A3E35" strokeWidth="2" />
      <ellipse cx="60" cy="60" rx="46" ry="12" fill="#151210" />
      <circle cx="46" cy="58" r="3" fill="#E9B872" /><circle cx="62" cy="62" r="2.5" fill="#E9B872" /><circle cx="74" cy="56" r="2" fill="#E9B872" />
    </svg>
  );
}

export function FlameMark({ size = 40 }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" aria-hidden="true">
      <defs>
        <linearGradient id={`fl${id}`} x1="20" y1="2" x2="20" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC277" /><stop offset="1" stopColor="#E2541E" />
        </linearGradient>
      </defs>
      <path d="M20 2c6 8 14 13 14 25a14 14 0 01-28 0c0-7 4-11 7-16 2 4 4 7 7 7 0-7-3-11 0-16z" fill={`url(#fl${id})`} />
      <path d="M20 24c3 4 6 6 6 11a6 6 0 01-12 0c0-4 3-6 6-11z" fill="#FFE2B8" />
    </svg>
  );
}
