import { ReactNode } from 'react'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function Toast({ type, message, action }: ToastProps) {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{icons[type]}</span>
        <p>{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium hover:opacity-80 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
