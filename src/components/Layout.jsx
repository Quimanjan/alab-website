import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Close, Menu } from './Icons.jsx';
import { site } from '../data/site.js';
import EmberField from './fx/EmberField.jsx';
import ScrollProgress from './fx/ScrollProgress.jsx';
import FireSound from './fx/FireSound.jsx';
import useInteractiveFx from './fx/useInteractiveFx.js';
import Intro from './fx/Intro.jsx';
import FireWipe from './fx/FireWipe.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/process', label: 'Process' },
  { to: '/sustainability', label: 'Sustainability' },
  { to: '/about', label: 'About' },
  { to: '/business-plan', label: 'Business Plan' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/visit', label: 'Visit' },
];

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="ALAB Eco Briquettes — home">
      <img src="/images/emblem.jpg" alt="" width="46" height="46" />
      <span>
        <span className="word">ALAB</span>
        <small>ECO BRIQUETTES</small>
      </span>
    </Link>
  );
}

function useScrolled() {
  const [s, setS] = useState(false);
  useEffect(() => {
    const on = () => setS(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return s;
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const scrolled = useScrolled();
  useInteractiveFx();

  useEffect(() => {
    setOpen(false);
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Anonymous page-view tracking (feeds the admin dashboard).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        fetch('/api/track', {
          method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname, referrer: document.referrer }),
        }).catch(() => {});
      } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="topbar">
        Free delivery within 2 km on <b>5 kg packs</b> · Pick-up at {site.addressShort} · Closed Fridays
      </div>
      <header className={`nav-shell${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap nav">
          <Logo />
          <nav className="nav-links" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
            ))}
          </nav>
          <div className="nav-cta">
            <FireSound />
            <Link to="/reviews#rate" className="btn fire sm">Rate ALAB</Link>
            <button
              type="button"
              className="menu-btn"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
        <div id="mobile-menu" className={`mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} tabIndex={open ? 0 : -1}>{l.label}</NavLink>
          ))}
          <Link to="/reviews#rate" className="btn fire" tabIndex={open ? 0 : -1}>Rate ALAB</Link>
        </div>
      </header>

      <main id="main" key={pathname} className="page-enter">
        <Outlet />
      </main>

      <Footer />
      <ScrollProgress />
      <FireWipe />
      <EmberField />
      <Intro />
    </>
  );
}

function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Logo />
            <p className="mute" style={{ lineHeight: 1.7, marginTop: 18, maxWidth: 320 }}>
              Waste to Warmth. Eco-friendly charcoal briquettes made from coconut shells and rice husks, bound with natural cassava starch.
            </p>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><Link to="/products">Products &amp; prices</Link></li>
              <li><Link to="/process">How it’s made</Link></li>
              <li><Link to="/sustainability">Sustainability</Link></li>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/business-plan">Business plan</Link></li>
            </ul>
          </div>
          <div>
            <h5>Customers</h5>
            <ul>
              <li><Link to="/reviews">Ratings &amp; feedback</Link></li>
              <li><Link to="/reviews#rate">Leave a review</Link></li>
              <li><Link to="/visit">Where to buy</Link></li>
              <li><Link to="/visit#faq">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h5>Visit</h5>
            <ul>
              <li>{site.address}</li>
              {site.hours.map((h) => <li key={h.days}>{h.days} · {h.time}</li>)}
              {site.email && <li><a href={`mailto:${site.email}`}>{site.email}</a></li>}
              {site.phone && <li><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></li>}
            </ul>
          </div>
        </div>
        <p className="big-word" aria-hidden="true">ALAB</p>
        <p className="secret">Psst — type <kbd>a</kbd><kbd>l</kbd><kbd>a</kbd><kbd>b</kbd> anywhere on the site. · <Link to="/admin" className="admin-link">Admin</Link></p>
        <div className="fbot">
          <span>© {new Date().getFullYear()} ALAB Eco Briquettes. All rights reserved.</span>
          <span>A business plan by BS Entrepreneurship students · City College of San Jose del Monte</span>
        </div>
      </div>
    </footer>
  );
}
