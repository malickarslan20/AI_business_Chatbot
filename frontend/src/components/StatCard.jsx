const colors = {
  purple: 'text-brandPurple bg-brandPurple/10 border-brandPurple/20',
  blue:   'text-brandBlue bg-brandBlue/10 border-brandBlue/20',
  green:  'text-brandGreen bg-brandGreen/10 border-brandGreen/20',
  orange: 'text-brandOrange bg-brandOrange/10 border-brandOrange/20',
}

export default function StatCard({ icon: Icon, label, value, color = 'purple', sub }) {
  const colorClass = colors[color] || colors.purple

  return (
    <div className="glass p-5 rounded-2xl border-white/5 hover:bg-white/[0.06] transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-bold text-textSecondary uppercase tracking-wider mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-textMain leading-none">{value ?? '0'}</p>
          {sub && <p className="text-[10px] sm:text-xs text-textMuted mt-1 truncate">{sub}</p>}
        </div>
      </div>
    </div>
  )
}
