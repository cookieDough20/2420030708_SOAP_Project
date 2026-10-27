/**
 * StatCard — Summary statistic card for dashboards.
 */

export default function StatCard({ icon, label, value, color = 'var(--primary)', subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <p className="stat-card-label">{label}</p>
        <h3 className="stat-card-value">{value}</h3>
        {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
