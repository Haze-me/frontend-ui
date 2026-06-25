import './pagination.css';

// page is 0-indexed (matches backend). onChange receives a 0-indexed page.
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button
        className="pg-btn"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ‹ Prev
      </button>

      {start > 0 && (
        <>
          <button className="pg-btn" onClick={() => onChange(0)}>1</button>
          {start > 1 && <span className="pg-dots">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`pg-btn ${p === page ? 'pg-active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="pg-dots">…</span>}
          <button className="pg-btn" onClick={() => onChange(totalPages - 1)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className="pg-btn"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Next ›
      </button>
    </div>
  );
}
