export default function Spinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="spinner-wrap" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  );
}
