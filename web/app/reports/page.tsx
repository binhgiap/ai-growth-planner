'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Header,
  Card,
  CardHeader,
  CardBody,
  Badge,
  ProgressBar,
  LoadingSpinner,
  Button,
  Alert,
} from '@/components'
import { useReports } from '@/hooks'

export default function ReportsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<'weekly' | 'monthly' | 'final'>('weekly')

  // Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.push('/setup')
      return
    }
    setUserId(storedUserId)
  }, [router])

  const { summary, loading, error } = useReports(userId || undefined)

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

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Alert variant="error" onClose={() => {}}>
            <p className="font-semibold">Error loading reports</p>
            <p className="text-sm">{error || 'No reports available yet'}</p>
          </Alert>
        </main>
      </div>
    )
  }

  const getReportToDisplay = () => {
    if (selectedReport === 'monthly') return summary.monthlyReport
    if (selectedReport === 'final') return summary.finalReport || summary.monthlyReport
    return summary.weeklyReports?.[0] || summary.monthlyReport
  }

  const report = getReportToDisplay()

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-600'
    if (rating >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingBadgeVariant = (rating: number): 'success' | 'warning' | 'error' => {
    if (rating >= 80) return 'success'
    if (rating >= 60) return 'warning'
    return 'error'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Growth Reports</h1>
          <p className="text-xl text-gray-600">
            Track your development progress with AI-generated insights
          </p>
        </div>

        {/* Report Selector */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setSelectedReport('weekly')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              selectedReport === 'weekly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 Weekly Reports
          </button>
          <button
            onClick={() => setSelectedReport('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              selectedReport === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Monthly Report
          </button>
          {summary.finalReport && (
            <button
              onClick={() => setSelectedReport('final')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                selectedReport === 'final'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏆 Final Report
            </button>
          )}
        </div>

        {/* Current Report */}
        <Card className="border-l-4 border-indigo-600">
          <CardHeader
            title={report?.period || 'Report'}
            subtitle={`Generated on ${new Date().toLocaleDateString()}`}
          />
          <CardBody>
            {/* Overall Rating */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-8">
              <p className="text-gray-600 text-sm font-medium mb-2">Overall Rating</p>
              <div className="flex items-center gap-4">
                <div className={`text-6xl font-bold ${getRatingColor(report?.overallRating || 0)}`}>
                  {report?.overallRating || 0}%
                </div>
                <div className="flex-1">
                  <ProgressBar
                    value={report?.overallRating || 0}
                    max={100}
                    label="Performance"
                    showPercentage={false}
                  />
                  <div className="mt-3">
                    <Badge variant={getRatingBadgeVariant(report?.overallRating || 0)} size="md">
                      {(report?.overallRating || 0) >= 80
                        ? 'Excellent'
                        : (report?.overallRating || 0) >= 60
                          ? 'Good'
                          : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {report?.summary && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{report.summary}</p>
              </div>
            )}

            {/* Strengths */}
            {report?.strengths && report.strengths.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💪</span>
                  <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {report.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {report?.weaknesses && report.weaknesses.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-lg font-semibold text-gray-900">Areas for Growth</h3>
                </div>
                <ul className="space-y-2">
                  {report.weaknesses.map((weakness: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-yellow-600 font-bold mt-0.5">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievements */}
            {report?.achievements && report.achievements.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg font-semibold text-gray-900">Key Achievements</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.achievements.map((achievement: any, idx: number) => (
                    <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="font-medium text-gray-900">{achievement.skill}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar
                          value={achievement.improvement}
                          max={100}
                          showPercentage={false}
                        />
                        <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                          +{achievement.improvement}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report?.recommendations && report.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {report.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-indigo-600 font-bold mt-0.5">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Completion Rate */}
        {report?.completionRate !== undefined && (
          <Card>
            <CardHeader title="Completion Rate" />
            <CardBody>
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {Math.round(report.completionRate)}%
                </div>
                <ProgressBar value={report.completionRate} max={100} showPercentage={false} />
                <p className="text-gray-600 mt-4">
                  You've completed {Math.round(report.completionRate)}% of your planned activities this period.
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="w-full px-6 py-3">
            📥 Download PDF Report
          </Button>
          <Button className="w-full px-6 py-3">
            📧 Share with Manager
          </Button>
          <Button className="w-full px-6 py-3">
            📋 Generate New Plan
          </Button>
        </div>
      </main>
    </div>
  )
}
