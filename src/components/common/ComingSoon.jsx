// Temporary placeholder for pages not yet built. Each page is built one at a
// time per the project plan; this keeps routing intact in the meantime.
export default function ComingSoon({ title }) {
  return (
    <div className="page container">
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <h3>{title}</h3>
        <p>This page is coming next. 🚧</p>
      </div>
    </div>
  );
}
