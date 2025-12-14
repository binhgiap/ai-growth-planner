'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">AI Growth Planner</h1>
          <div className="space-x-4">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/plan" className="text-gray-600 hover:text-gray-900">Plan</a>
            <a href="/reports" className="text-gray-600 hover:text-gray-900">Reports</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AI Growth Planner
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Generate your personalized 6-month development roadmap powered by AI
          </p>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            Get Started
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600">Track your progress with real-time insights</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Planning</h3>
            <p className="text-gray-600">AI-generated OKRs and daily tasks</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">HR Reports</h3>
            <p className="text-gray-600">Comprehensive development summaries</p>
          </div>
        </div>
      </main>
    </div>
  )
}
