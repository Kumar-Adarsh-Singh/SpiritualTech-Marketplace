export default function StatsCard({ icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary/20 to-primary-dark/10 border-primary/20',
    success: 'from-success/20 to-success/5 border-success/20',
    warning: 'from-warning/20 to-warning/5 border-warning/20',
    danger: 'from-danger/20 to-danger/5 border-danger/20',
    accent: 'from-accent/20 to-accent/5 border-accent/20',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 flex items-center gap-4`}
    >
      <div className="p-3 rounded-lg bg-surface-light/50">{icon}</div>
      <div>
        <p className="text-2xl font-heading font-bold text-text">{value}</p>
        <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
