'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header, Card, CardHeader, CardBody, TaskItem, Badge, LoadingSpinner, ProgressBar, Alert } from '@/components'
import { useDailyTasks } from '@/hooks'
import { formatDate } from '@/lib/utils'
import { DailyTaskService } from '@/lib/services'

export default function DailyPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const dateStr = new Date().toISOString().split('T')[0] || ''
  const [selectedDate, setSelectedDate] = useState<string>(dateStr)
  const [completing, setCompleting] = useState(false)

  // Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.push('/setup')
      return
    }
    setUserId(storedUserId)
  }, [router])

  const { tasks, loading, error, updateTask, completeTask, refetch } = useDailyTasks(userId || undefined)

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompleting(true)
      await completeTask(taskId)
      // Refetch to get updated data
      setTimeout(() => refetch(), 500)
    } catch (err: any) {
      console.error('Failed to complete task:', err)
    } finally {
      setCompleting(false)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      await updateTask(taskId, updates)
    } catch (err: any) {
      console.error('Failed to update task:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center h-96">
          <LoadingSpinner />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Alert variant="error" onClose={() => {}}>
            <p className="font-semibold">Error loading tasks</p>
            <p className="text-sm">{error}</p>
          </Alert>
        </main>
      </div>
    )
  }

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  const tasksByStatus = {
    'NOT_STARTED': tasks.filter((t) => t.status === 'NOT_STARTED'),
    'IN_PROGRESS': tasks.filter((t) => t.status === 'IN_PROGRESS'),
    'COMPLETED': tasks.filter((t) => t.status === 'COMPLETED'),
  }

  const tasksByPriority = {
    1: tasks.filter((t) => t.priority === 1),
    2: tasks.filter((t) => t.priority === 2),
    3: tasks.filter((t) => t.priority === 3),
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'High'
      case 2:
        return 'Medium'
      case 3:
        return 'Low'
      default:
        return 'Normal'
    }
  }

  const getPriorityVariant = (priority: number) => {
    switch (priority) {
      case 1:
        return 'error'
      case 2:
        return 'warning'
      default:
        return 'info'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
      case 'IN_PROGRESS':
        return 'warning'
      default:
        return 'info'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Tasks</h1>
          <p className="text-xl text-gray-600">
            {formatDate(new Date(selectedDate))} - Stay focused on your growth journey
          </p>
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader
            title="Today's Progress"
            subtitle={`${completedCount} of ${tasks.length} tasks completed`}
          />
          <CardBody>
            <ProgressBar value={progressPercentage} max={100} label="Completion" showPercentage={true} />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{tasksByStatus['NOT_STARTED'].length}</p>
                <p className="text-sm text-gray-600">Not Started</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{tasksByStatus['IN_PROGRESS'].length}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{tasksByStatus['COMPLETED'].length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tasks by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Not Started */}
          <Card>
            <CardHeader title="Not Started" subtitle={`${tasksByStatus['NOT_STARTED'].length} tasks`} />
            <CardBody>
              {tasksByStatus['NOT_STARTED'].length > 0 ? (
                <div className="space-y-3">
                  {tasksByStatus['NOT_STARTED'].map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'COMPLETED'}
                          onChange={() => handleCompleteTask(task.id)}
                          disabled={completing}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <Badge variant={getPriorityVariant(task.priority)} size="sm">
                              {getPriorityLabel(task.priority)}
                            </Badge>
                            {task.estimatedHours && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                {task.estimatedHours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">All caught up!</p>
              )}
            </CardBody>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader title="In Progress" subtitle={`${tasksByStatus['IN_PROGRESS'].length} tasks`} />
            <CardBody>
              {tasksByStatus['IN_PROGRESS'].length > 0 ? (
                <div className="space-y-3">
                  {tasksByStatus['IN_PROGRESS'].map((task) => (
                    <div
                      key={task.id}
                      className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'COMPLETED'}
                          onChange={() => handleCompleteTask(task.id)}
                          disabled={completing}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <Badge variant="warning" size="sm">
                              In Progress
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Start some tasks!</p>
              )}
            </CardBody>
          </Card>

          {/* Completed */}
          <Card>
            <CardHeader title="Completed" subtitle={`${tasksByStatus['COMPLETED'].length} tasks`} />
            <CardBody>
              {tasksByStatus['COMPLETED'].length > 0 ? (
                <div className="space-y-3">
                  {tasksByStatus['COMPLETED'].map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 opacity-75"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm line-through">{task.title}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <Badge variant="success" size="sm">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Complete your first task!</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* By Priority */}
        <Card>
          <CardHeader title="Tasks by Priority" />
          <CardBody>
            <div className="space-y-6">
              {[1, 2, 3].map((priority) => (
                <div key={priority}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={getPriorityVariant(priority)} size="sm">
                      {getPriorityLabel(priority)} Priority
                    </Badge>
                    <span className="text-sm text-gray-600">
                      ({tasksByPriority[priority as keyof typeof tasksByPriority].length} tasks)
                    </span>
                  </div>
                  {tasksByPriority[priority as keyof typeof tasksByPriority].length > 0 ? (
                    <ul className="space-y-2 list-disc list-inside">
                      {tasksByPriority[priority as keyof typeof tasksByPriority].map((task) => (
                        <li key={task.id} className="text-gray-700">
                          <span className="font-medium">{task.title}</span>
                          {task.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={completing}
                              className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                            >
                              Mark Done
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No {getPriorityLabel(priority).toLowerCase()} priority tasks</p>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Motivation Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">💪 You've got this!</h2>
          <p className="text-indigo-100 mb-4">
            {completedCount > 0
              ? `Great progress! You've completed ${completedCount} task${completedCount !== 1 ? 's' : ''} today. Keep going!`
              : "Let's start your day strong. Pick the first task and get going!"}
          </p>
          {tasksByStatus['NOT_STARTED'].length > 0 && (
            <button className="px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition">
              Start Next Task
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
