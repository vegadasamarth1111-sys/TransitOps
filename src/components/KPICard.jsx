export default function KPICard({ label, value, accentColor }) {
  return (
    <div className="kpi-card" style={{ '--kpi-accent': accentColor || 'var(--accent)' }}>
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{value}</div>
    </div>
  );
}
