import { ReactNode } from 'react'

interface AlertProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info'
  icon?: ReactNode
  onClose?: () => void
}

export function Alert({ children, variant = 'info', icon, onClose }: AlertProps) {
  const variantStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const variantIcons = {
    success: '✓',
    warning: '⚠️',
    error: '✕',
    info: 'ℹ️',
  }

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${variantStyles[variant]}`}>
      <span className="text-lg flex-shrink-0">{icon || variantIcons[variant]}</span>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg hover:opacity-70 flex-shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  )
}
