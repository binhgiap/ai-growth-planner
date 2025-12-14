import Link from 'next/link'
import { Header, Button, Card } from '@/components'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personalized
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Career Growth Roadmap
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Powered by AI, our platform generates a comprehensive 6-month development plan tailored to your goals and skill gaps.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/plan">
              <Button variant="outline" size="lg">View Sample Plan</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Dashboard</h3>
            <p className="text-gray-600">
              Real-time progress tracking with detailed analytics and visual insights into your development journey.
            </p>
          </Card>
          <Card>
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Driven Planning</h3>
            <p className="text-gray-600">
              Our intelligent agents create OKRs and daily tasks perfectly aligned with your career goals.
            </p>
          </Card>
          <Card>
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">HR Reports</h3>
            <p className="text-gray-600">
              Comprehensive evaluations and recommendations powered by advanced AI analysis.
            </p>
          </Card>
        </div>

        {/* Features Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="border-2 border-indigo-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Get</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <span className="text-indigo-600 font-bold">✓</span>
                6-month personalized roadmap
              </li>
              <li className="flex items-center gap-3">
                <span className="text-indigo-600 font-bold">✓</span>
                180 daily micro-learning tasks
              </li>
              <li className="flex items-center gap-3">
                <span className="text-indigo-600 font-bold">✓</span>
                Weekly & monthly progress reports
              </li>
              <li className="flex items-center gap-3">
                <span className="text-indigo-600 font-bold">✓</span>
                Skill gap analysis
              </li>
              <li className="flex items-center gap-3">
                <span className="text-indigo-600 font-bold">✓</span>
                HR-ready summaries
              </li>
            </ul>
          </Card>

          <Card className="border-2 border-purple-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">1</span>
                <span>Build your profile with current skills and target role</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">2</span>
                <span>AI analyzes skill gaps and generates OKRs</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">3</span>
                <span>Receive daily tasks aligned with your goals</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">4</span>
                <span>Track progress and get actionable insights</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">5</span>
                <span>Share HR reports with your manager</span>
              </li>
            </ol>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Growth Journey?</h3>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals building their personalized career roadmaps with AI.
          </p>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Launch Dashboard
            </Button>
          </Link>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 AI Growth Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
