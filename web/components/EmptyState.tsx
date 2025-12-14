interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 max-w-md mb-6">{description}</p>
      )}
      {action && (
        <a
          href={action.href}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
