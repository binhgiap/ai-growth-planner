'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header, Card, CardHeader, CardBody, Badge, LoadingSpinner, ProgressBar, Alert } from '@/components'
import { useGoals } from '@/hooks'

export default function PlanPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [skillGaps, setSkillGaps] = useState<any[]>([])

  // Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.push('/setup')
      return
    }
    setUserId(storedUserId)
  }, [router])

  const { goals, loading, error } = useGoals(userId || undefined)

  // Simulate skill gaps from goals
  useEffect(() => {
    if (goals.length > 0) {
      // Extract skill gaps from goals description
      setSkillGaps([
        { skill: 'System Design', current: 40, target: 90, priority: 'high' },
        { skill: 'Leadership', current: 30, target: 80, priority: 'high' },
        { skill: 'Architecture', current: 50, target: 85, priority: 'medium' },
        { skill: 'Communication', current: 70, target: 90, priority: 'medium' },
        { skill: 'Problem Solving', current: 75, target: 95, priority: 'low' },
      ])
    }
  }, [goals])

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

  const priorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your 6-Month Growth Plan</h1>
          <p className="text-xl text-gray-600">
            Personalized objectives and key results powered by AI analysis
          </p>
        </div>

        {error && (
          <Alert variant="error" onClose={() => {}}>
            <p className="font-semibold">Error loading plan</p>
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        {/* Skill Gaps Analysis */}
        <Card>
          <CardHeader
            title="Skill Gap Analysis"
            subtitle="Key areas to develop over the next 6 months"
          />
          <CardBody>
            <div className="space-y-6">
              {skillGaps.map((gap) => (
                <div key={gap.skill}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{gap.skill}</h4>
                      <Badge variant={priorityBadgeVariant(gap.priority)} size="sm">
                        {gap.priority}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      {gap.current}% → {gap.target}%
                    </span>
                  </div>
                  <ProgressBar value={gap.current} max={100} label="" showPercentage={false} />
                  <div className="mt-2 flex gap-2 text-xs text-gray-500">
                    <span>Current: {gap.current}%</span>
                    <span>•</span>
                    <span>Target: {gap.target}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Goals/OKRs */}
        <Card>
          <CardHeader
            title="Your OKRs (Objectives & Key Results)"
            subtitle={`${goals.length} goals aligned with your target role`}
          />
          <CardBody>
            {goals.length > 0 ? (
              <div className="space-y-6">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                          <Badge
                            variant={goal.status === 'COMPLETED' ? 'success' : 'info'}
                            size="sm"
                          >
                            {goal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                      <span className="text-sm font-medium text-indigo-600">
                        {goal.priority === 1 ? 'P0' : goal.priority === 2 ? 'P1' : 'P2'}
                      </span>
                    </div>
                    <ProgressBar value={goal.progress || 0} max={100} label="Progress" showPercentage={true} />
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {goal.type && (
                        <Badge variant="info" size="sm">
                          {goal.type}
                        </Badge>
                      )}
                      {goal.startDate && (
                        <span className="text-xs text-gray-500">
                          Start: {new Date(goal.startDate).toLocaleDateString()}
                        </span>
                      )}
                      {goal.targetDate && (
                        <span className="text-xs text-gray-500">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No goals created yet</p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                  Create First Goal
                </button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader title="6-Month Timeline" />
          <CardBody>
            <div className="relative">
              <div className="flex justify-between mb-8">
                {['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'].map((month, idx) => (
                  <div key={month} className="text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-white mb-2 mx-auto ${
                        idx === 0 ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{month}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full absolute top-5 left-5 right-5"></div>
            </div>
          </CardBody>
        </Card>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Start Your Journey?</h2>
          <p className="mb-6 text-indigo-100">
            {goals.length > 0
              ? `You have ${goals.length} goals to achieve. Check your daily tasks to get started!`
              : 'Create your first goal and begin your growth journey today.'}
          </p>
          <button className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition">
            📅 View Daily Tasks
          </button>
        </div>
      </main>
    </div>
  )
}
