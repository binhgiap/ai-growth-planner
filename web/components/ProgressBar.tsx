interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = (value / max) * 100

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
