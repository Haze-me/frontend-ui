import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import './productCard.css';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#eef2f7"/><text x="50%" y="50%" font-family="Inter,sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle" dy=".3em">No image</text></svg>`
  );

function Stars({ rating = 0 }) {
  const r = Math.round(rating);
  return (
    <span className="pc-stars" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= r ? 'star-on' : 'star-off'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductCard({ product }) {
  const {
    productId,
    name,
    brand,
    price,
    primaryImageUrl,
    averageRating,
    reviewCount,
    inStock,
  } = product;

  return (
    <Link to={`/products/${productId}`} className="product-card">
      <div className="pc-img-wrap">
        <img
          src={primaryImageUrl || PLACEHOLDER}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        {!inStock && <span className="pc-oos">Out of Stock</span>}
      </div>
      <div className="pc-body">
        {brand && <span className="pc-brand">{brand}</span>}
        <h3 className="pc-name">{name}</h3>
        <div className="pc-rating">
          <Stars rating={averageRating} />
          <span className="pc-reviews">({reviewCount || 0})</span>
        </div>
        <div className="pc-price">{formatCurrency(price)}</div>
      </div>
    </Link>
  );
}
