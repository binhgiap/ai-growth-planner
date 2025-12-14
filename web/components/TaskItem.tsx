import { Badge } from './Badge'

interface TaskItemProps {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  onComplete?: (id: string) => void
}

export function TaskItem({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  onComplete,
}: TaskItemProps) {
  const statusColors = {
    pending: 'default',
    'in-progress': 'info',
    completed: 'success',
  } as const

  const priorityColors = {
    low: 'info',
    medium: 'warning',
    high: 'error',
  } as const

  const statusLabels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          <div className="flex gap-2 mt-3">
            <Badge variant={statusColors[status]} size="sm">
              {statusLabels[status]}
            </Badge>
            <Badge variant={priorityColors[priority]} size="sm">
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </Badge>
          </div>
        </div>
        <input
          type="checkbox"
          checked={status === 'completed'}
          onChange={() => onComplete?.(id)}
          className="w-5 h-5 text-indigo-600 rounded cursor-pointer mt-1"
        />
      </div>
      {dueDate && <p className="text-xs text-gray-500 mt-3">Due: {dueDate}</p>}
    </div>
  )
}
