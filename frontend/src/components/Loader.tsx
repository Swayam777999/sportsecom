export default function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="center-box" role="status" aria-live="polite">
      <div className="spinner" />
      <p className="muted">{label}</p>
    </div>
  );
}
