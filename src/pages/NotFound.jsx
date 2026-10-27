import { Link } from 'react-router-dom';
import { BriquetteArt } from '../components/Art.jsx';

export default function NotFound() {
  return (
    <section className="page-hero" style={{ textAlign: 'center', paddingBottom: 40 }}>
      <div className="wrap" style={{ display: 'grid', justifyItems: 'center' }}>
        <BriquetteArt size={130} />
        <span className="eyebrow" style={{ marginTop: 20 }}>404</span>
        <h1 style={{ marginInline: 'auto' }}>This page went <em>up in smoke.</em></h1>
        <p className="lead" style={{ marginInline: 'auto' }}>The page you’re looking for doesn’t exist. Let’s get you back to the fire.</p>
        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 28 }}>
          <Link to="/" className="btn fire">Back to home</Link>
          <Link to="/products" className="btn line">See the briquettes</Link>
        </div>
      </div>
    </section>
  );
}
