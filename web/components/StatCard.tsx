import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: number
  trendLabel?: string
}

export function StatCard({ label, value, icon, trend, trendLabel }: StatCardProps) {
  const trendColor = trend && trend >= 0 ? 'text-green-600' : 'text-red-600'
  const trendIcon = trend && trend >= 0 ? '↑' : '↓'

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trendColor}`}>
              {trendIcon} {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>
        {icon && <div className="text-4xl opacity-50">{icon}</div>}
      </div>
    </div>
  )
}
