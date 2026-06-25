import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCategories, getProductsSorted } from '../../api/catalogApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/common/ProductCard';
import './homepage.css';

// Decorative gradient/emoji per category so the grid looks designed even
// before the backend supplies category imagery.
const CATEGORY_LOOKS = [
  { icon: '📱', from: '#2563eb', to: '#0a1628' },
  { icon: '💻', from: '#f97316', to: '#b91c1c' },
  { icon: '🎧', from: '#16a34a', to: '#065f46' },
  { icon: '⌚', from: '#7c3aed', to: '#1e1b4b' },
  { icon: '📷', from: '#0ea5e9', to: '#0c4a6e' },
  { icon: '🎮', from: '#db2777', to: '#500724' },
  { icon: '🖥️', from: '#ca8a04', to: '#422006' },
  { icon: '🔌', from: '#0d9488', to: '#134e4a' },
];

function CardSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 0 }} />
      <div className="pc-body">
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
        <div className="skeleton" style={{ height: 16, width: '90%' }} />
        <div className="skeleton" style={{ height: 16, width: '60%' }} />
        <div className="skeleton" style={{ height: 20, width: '50%', marginTop: 8 }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);
  const [heroQuery, setHeroQuery] = useState('');

  useEffect(() => {
    let active = true;

    getCategories()
      .then((data) => {
        if (active) setCategories(Array.isArray(data) ? data : data?.content || []);
      })
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load categories')))
      .finally(() => active && setLoadingCats(false));

    getProductsSorted({ page: 0, size: 8, sortBy: 'rating' })
      .then((data) => {
        if (active) setProducts(data?.content || []);
      })
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load products')))
      .finally(() => active && setLoadingProds(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onHeroSearch = (e) => {
    e.preventDefault();
    const q = heroQuery.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  return (
    <div className="page">
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-inner">
          <span className="hero-eyebrow">Nigeria's #1 Electronics Marketplace</span>
          <h1 className="hero-title">
            Premium tech.<br />
            <span className="hero-title-accent">Trusted vendors.</span> Fair prices.
          </h1>
          <p className="hero-sub">
            Shop phones, laptops, audio and more from verified vendors across
            Nigeria — with secure Paystack checkout and fast delivery.
          </p>

          <form className="hero-search" onSubmit={onHeroSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="What are you shopping for today?"
            />
            <button type="submit" className="btn btn-accent">Search</button>
          </form>

          <div className="hero-trust">
            <span>🔒 Secure Paystack payments</span>
            <span>🚚 Nationwide delivery</span>
            <span>✅ Verified vendors</span>
          </div>
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Shop by category</h2>
              <p>Find exactly what you need, faster.</p>
            </div>
            <Link to="/products" className="link-accent">View all →</Link>
          </div>

          <div className="cat-grid">
            {loadingCats
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />
                ))
              : categories.slice(0, 8).map((cat, i) => {
                  const look = CATEGORY_LOOKS[i % CATEGORY_LOOKS.length];
                  return (
                    <Link
                      key={cat.categoryId}
                      to={`/products?categoryId=${cat.categoryId}`}
                      className="cat-card"
                      style={{
                        background: `linear-gradient(135deg, ${look.from}, ${look.to})`,
                      }}
                    >
                      <span className="cat-icon">{look.icon}</span>
                      <span className="cat-name">{cat.name}</span>
                    </Link>
                  );
                })}
            {!loadingCats && categories.length === 0 && (
              <p className="muted">No categories available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Featured products ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Popular right now</h2>
              <p>Top-rated picks loved by shoppers.</p>
            </div>
            <Link to="/products?sortBy=rating" className="link-accent">See more →</Link>
          </div>

          <div className="prod-grid">
            {loadingProds
              ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
              : products.map((p) => <ProductCard key={p.productId} product={p} />)}
          </div>

          {!loadingProds && products.length === 0 && (
            <div className="empty-state">
              <h3>No products yet</h3>
              <p>Check back soon — vendors are adding products.</p>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- CTA banner ---------------- */}
      <section className="container">
        <div className="cta-banner">
          <div className="cta-text">
            <h2>Are you a vendor?</h2>
            <p>List your products on Chyno-Shop and reach thousands of buyers across Nigeria.</p>
          </div>
          <Link to="/vendor/register" className="btn btn-accent btn-lg">
            Start selling →
          </Link>
        </div>
      </section>
    </div>
  );
}
