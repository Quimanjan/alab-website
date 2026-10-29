import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Process from './pages/Process.jsx';
import Sustainability from './pages/Sustainability.jsx';
import About from './pages/About.jsx';
import BusinessPlan from './pages/BusinessPlan.jsx';
import Reviews from './pages/Reviews.jsx';
import Visit from './pages/Visit.jsx';
import NotFound from './pages/NotFound.jsx';

const Admin = lazy(() => import('./admin/Admin.jsx'));

const titles = {
  '/': 'ALAB Eco Briquettes — Waste to Warmth',
  '/products': 'Products & Prices — ALAB Eco Briquettes',
  '/process': 'How It’s Made — ALAB Eco Briquettes',
  '/sustainability': 'Sustainability — ALAB Eco Briquettes',
  '/about': 'About Us — ALAB Eco Briquettes',
  '/business-plan': 'Business Plan — ALAB Eco Briquettes',
  '/reviews': 'Ratings & Feedback — ALAB Eco Briquettes',
  '/visit': 'Visit & Where to Buy — ALAB Eco Briquettes',
};

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    document.title = titles[pathname] || 'Page not found — ALAB Eco Briquettes';
  }, [pathname]);

  return (
    <Routes>
      <Route path="admin/*" element={<Suspense fallback={<div className="adm-boot" />}><Admin /></Suspense>} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="process" element={<Process />} />
        <Route path="sustainability" element={<Sustainability />} />
        <Route path="about" element={<About />} />
        <Route path="business-plan" element={<BusinessPlan />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="visit" element={<Visit />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
