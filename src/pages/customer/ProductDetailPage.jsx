import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getProduct } from '../../api/catalogApi';
import { getApiErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/common/Spinner';
import './productDetail.css';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="500" height="500" fill="#eef2f7"/><text x="50%" y="50%" font-family="Inter,sans-serif" font-size="22" fill="#94a3b8" text-anchor="middle" dy=".3em">No image</text></svg>`
  );

// Product images may come back as strings or as objects with a url field.
function normalizeImages(product) {
  const imgs = [];
  if (Array.isArray(product?.images)) {
    product.images.forEach((im) => {
      if (typeof im === 'string') imgs.push(im);
      else if (im?.imageUrl) imgs.push(im.imageUrl);
      else if (im?.url) imgs.push(im.url);
    });
  }
  if (product?.primaryImageUrl && !imgs.includes(product.primaryImageUrl)) {
    imgs.unshift(product.primaryImageUrl);
  }
  return imgs.length ? imgs : [PLACEHOLDER];
}

function Stars({ rating = 0 }) {
  const r = Math.round(rating);
  return (
    <span className="pd-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= r ? 'star-on' : 'star-off'}>★</span>
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isCustomerLoggedIn } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProduct(productId)
      .then((data) => {
        if (active) {
          setProduct(data);
          setActiveImg(0);
          setQty(1);
        }
      })
      .catch((err) => {
        if (active) toast.error(getApiErrorMessage(err, 'Could not load product'));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleAdd = async () => {
    // Rule #2/#3: guests are sent to login and returned here afterward.
    if (!isCustomerLoggedIn) {
      toast.info('Please log in to add items to your cart');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setAdding(true);
    try {
      await addItem(product.productId, qty);
      toast.success(`Added ${qty} × ${product.name} to cart`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add to cart'));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="page"><Spinner fullPage /></div>;

  if (!product) {
    return (
      <div className="page container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <h3>Product not found</h3>
          <p>This product may no longer be available.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const images = normalizeImages(product);
  const inStock = product.inStock !== false;

  return (
    <div className="page container pd-page">
      <nav className="pd-breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> /{' '}
        <span>{product.name}</span>
      </nav>

      <div className="pd-grid">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-img">
            <img
              src={images[activeImg]}
              alt={product.name}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
            />
            {!inStock && <span className="pd-oos-tag">Out of Stock</span>}
          </div>
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${i === activeImg ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          {product.brand && <span className="pd-brand">{product.brand}</span>}
          <h1 className="pd-name">{product.name}</h1>

          <div className="pd-rating">
            <Stars rating={product.averageRating} />
            <span className="muted">
              {(product.averageRating || 0).toFixed(1)} · {product.reviewCount || 0} reviews
            </span>
          </div>

          <div className="pd-price">{formatCurrency(product.price)}</div>

          <div className={`pd-stock ${inStock ? 'in' : 'out'}`}>
            <span className="dot" /> {inStock ? 'In Stock' : 'Out of Stock'}
          </div>

          <div className="pd-buy">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={!inStock}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} disabled={!inStock}>+</button>
            </div>
            <button
              className="btn btn-accent btn-lg"
              onClick={handleAdd}
              disabled={!inStock || adding}
            >
              {!inStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>

          {product.description && (
            <div className="pd-desc">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
