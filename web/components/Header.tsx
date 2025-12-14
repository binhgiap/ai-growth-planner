import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Growth Planner
          </span>
        </Link>
        <div className="flex space-x-6">
          <Link 
            href="/dashboard" 
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Dashboard
          </Link>
          <Link 
            href="/plan" 
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Plan
          </Link>
          <Link 
            href="/daily" 
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Daily Tasks
          </Link>
          <Link 
            href="/reports" 
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Reports
          </Link>
        </div>
      </nav>
    </header>
  )
}
