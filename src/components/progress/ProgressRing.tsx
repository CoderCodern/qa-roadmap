'use client'

interface ProgressRingProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ completed, total, size = 160, strokeWidth = 10 }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const pct = total > 0 ? completed / total : 0
  const dashOffset = circumference * (1 - pct)
  const percentage = Math.round(pct * 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="text-brand-500 transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completed}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">of {total}</p>
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{percentage}%</p>
      </div>
    </div>
  )
}
