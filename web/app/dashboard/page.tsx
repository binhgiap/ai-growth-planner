'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Header,
  Card,
  CardHeader,
  CardBody,
  StatCard,
  ProgressBar,
  LoadingSpinner,
  Badge,
  TaskItem,
  Alert,
} from '@/components'
import { useGoals, useDailyTasks } from '@/hooks'
import { UserService } from '@/lib/services'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  // Get userId from localStorage
  const [userId, setUserId] = useState<string | null>(null)

  // Custom hooks for data
  const { goals, loading: goalsLoading } = useGoals(userId || undefined)
  const { tasks, loading: tasksLoading } = useDailyTasks(userId || undefined)

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.push('/setup')
      return
    }
    setUserId(storedUserId)
  }, [router])

  // Fetch user profile
  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      try {
        setUserLoading(true)
        setUserError(null)
        const userData = await UserService.getUserById(userId)
        setUser(userData)
      } catch (err: any) {
        setUserError(err.message || 'Failed to load profile')
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const loading = userLoading || goalsLoading || tasksLoading
  const error = userError

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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Alert variant="error" onClose={() => setUserError(null)}>
            <p className="font-semibold">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </Alert>
        </main>
      </div>
    )
  }

  // Calculate progress metrics
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length
  const inProgressGoals = goals.filter((g) => g.status === 'IN_PROGRESS').length
  const goalProgress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0

  // Get next 5 tasks
  const nextTasks = tasks.slice(0, 5)

  // Get upcoming goals
  const upcomingGoals = goals.filter((g) => g.status !== 'COMPLETED').slice(0, 3)

  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {fullName}!</h1>
          <p className="text-indigo-100 mb-4">
            {user.currentRole} → {user.targetRole}
          </p>
          <div className="flex gap-6">
            <div>
              <p className="text-indigo-200 text-sm">Tasks Progress</p>
              <p className="text-2xl font-bold">{Math.round(taskProgress)}%</p>
            </div>
            <div>
              <p className="text-indigo-200 text-sm">Goals On Track</p>
              <p className="text-2xl font-bold">{inProgressGoals}/{goals.length}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-sm">Learning Hours</p>
              <p className="text-2xl font-bold">{user.hoursPerWeek}h/week</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Tasks Completed"
            value={completedTasks}
            icon="✓"
            trend={Math.round(taskProgress)}
          />
          <StatCard
            label="Goals In Progress"
            value={inProgressGoals}
            icon="🎯"
            trend={Math.round((inProgressGoals / goals.length) * 100) || 0}
          />
          <StatCard
            label="Total Goals"
            value={goals.length}
            icon="📊"
            trend={0}
          />
          <StatCard
            label="Available Hours"
            value={user.hoursPerWeek}
            icon="⏱️"
            trend={0}
          />
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Task Progress" />
            <CardBody>
              <ProgressBar value={taskProgress} max={100} label="Overall" showPercentage={true} />
              <p className="text-sm text-gray-600 mt-4">
                {completedTasks} of {tasks.length} tasks completed
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Goal Progress" />
            <CardBody>
              <ProgressBar value={goalProgress} max={100} label="Overall" showPercentage={true} />
              <p className="text-sm text-gray-600 mt-4">
                {completedGoals} of {goals.length} goals completed
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Tasks and Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Tasks */}
          <Card>
            <CardHeader
              title="Next Tasks"
              subtitle={`${nextTasks.length} tasks ready`}
            />
            <CardBody>
              {nextTasks.length > 0 ? (
                <div className="space-y-3">
                  {nextTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <input type="checkbox" className="mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <div className="flex gap-2 mt-1">
                          {task.priority && (
                            <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'info'} size="sm">
                              {task.priority}
                            </Badge>
                          )}
                          <Badge variant={task.status === 'COMPLETED' ? 'success' : 'info'} size="sm">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tasks yet</p>
              )}
            </CardBody>
          </Card>

          {/* Upcoming Goals */}
          <Card>
            <CardHeader
              title="Upcoming Goals"
              subtitle={`${upcomingGoals.length} goals in progress`}
            />
            <CardBody>
              {upcomingGoals.length > 0 ? (
                <div className="space-y-4">
                  {upcomingGoals.map((goal) => (
                    <div key={goal.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900">{goal.title}</p>
                        <Badge variant="info" size="sm">
                          {goal.status}
                        </Badge>
                      </div>
                      <ProgressBar value={goal.progress || 0} max={100} showPercentage={true} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No goals yet</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition">
                📅 View Full Plan
              </button>
              <button className="p-4 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition">
                ✓ Mark Tasks Today
              </button>
              <button className="p-4 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition">
                📊 View Reports
              </button>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
