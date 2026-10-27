const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function Svg({ size = 24, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...base} {...rest}>
      {children}
    </svg>
  );
}

export const Clock = (p) => <Svg {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6" /></Svg>;
export const Flame = (p) => <Svg {...p}><path d="M12 2c3 4 6 6 6 11a6 6 0 01-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-7z" /></Svg>;
export const Smoke = (p) => <Svg {...p}><path d="M3 9c3-2 5 2 8 0s5 2 8 0M3 15c3-2 5 2 8 0s5 2 8 0" /></Svg>;
export const Leaf = (p) => <Svg {...p}><path d="M5 19c8 0 14-6 14-14C11 5 5 11 5 19zM5 19l7-7" /></Svg>;
export const Check = (p) => <Svg strokeWidth={2.4} {...p}><path d="M5 12l5 5 9-10" /></Svg>;
export const Arrow = (p) => <Svg strokeWidth={2.2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
export const Move = (p) => <Svg strokeWidth={2} {...p}><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></Svg>;
export const Menu = (p) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const Close = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const Pin = (p) => <Svg {...p}><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></Svg>;
export const Truck = (p) => <Svg {...p}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></Svg>;
export const Shield = (p) => <Svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></Svg>;
export const Users = (p) => <Svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5" /><circle cx="17" cy="9" r="2.6" /><path d="M16.5 14.6c2.6.3 4.3 2.2 5 5" /></Svg>;
export const Recycle = (p) => <Svg {...p}><path d="M7 19l-3-5 3-5M17 5l3 5-3 5M4 14h9M20 10h-9" /></Svg>;
export const Coin = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9 8h4.5a2.5 2.5 0 010 5H9zM9 13v4M7.5 10.5h8M7.5 8h8" /></Svg>;
export const Box = (p) => <Svg {...p}><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4M12 11v10" /></Svg>;
export const Chat = (p) => <Svg {...p}><path d="M4 5h16v11H9l-5 4z" /></Svg>;
export const Store = (p) => <Svg {...p}><path d="M4 10v10h16V10M3 6l2-3h14l2 3v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0z" /></Svg>;
export const Sun = (p) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></Svg>;
export const Scale = (p) => <Svg {...p}><path d="M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 006 0zM18 7l-3 7a3 3 0 006 0z" /></Svg>;
export const Refresh = (p) => <Svg {...p}><path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" /></Svg>;

export function Star({ size = 18, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const featureIcon = { burn: Clock, flame: Flame, smoke: Smoke, leaf: Leaf };
