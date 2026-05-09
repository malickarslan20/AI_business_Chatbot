export default function StatCard({ icon: Icon, label, value, color = 'purple', sub }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card-icon">
        <Icon size={22} />
      </div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value ?? '—'}</p>
        {sub && <p className="stat-card-sub">{sub}</p>}
      </div>
    </div>
  )
}
