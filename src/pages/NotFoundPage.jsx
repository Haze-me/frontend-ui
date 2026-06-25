import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page container">
      <div className="empty-state" style={{ paddingTop: 110 }}>
        <h1 style={{ fontSize: '5rem', color: 'var(--blue)' }}>404</h1>
        <h3 style={{ marginTop: 8 }}>Page not found</h3>
        <p style={{ marginBottom: 24 }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
