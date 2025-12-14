'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header, Card, CardHeader, CardBody, Button, Alert } from '@/components'
import { useToast } from '@/hooks'
import { UserService } from '@/lib/services'

interface FormData {
  firstName: string
  lastName: string
  email: string
  currentRole: string
  targetRole: string
  experience: string
  skills: string[]
  hoursPerWeek: number
}

export default function SetupPage() {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentRole: '',
    targetRole: '',
    experience: '',
    skills: [] as string[],
    hoursPerWeek: 5,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, e.currentTarget.value.trim()],
      }))
      e.currentTarget.value = ''
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error('Please fill in all required fields')
      }

      // Create user profile via API
      const user = await UserService.createUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        currentRole: formData.currentRole,
        targetRole: formData.targetRole,
        skills: formData.skills,
        hoursPerWeek: formData.hoursPerWeek,
        bio: `${formData.experience} years of experience`,
      })

      // Store user ID in localStorage
      localStorage.setItem('userId', user.id)
      localStorage.setItem('user', JSON.stringify(user))

      showSuccess('Profile created successfully!')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create profile'
      setErrorMessage(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && formData.currentRole && formData.experience
  const isStep2Valid = formData.targetRole

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {errorMessage && (
          <Alert
            variant="error"
            onClose={() => setErrorMessage(null)}
          >
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </Alert>
        )}

        <Card>
          <CardHeader
            title="Let's Get Started! 🚀"
            subtitle="Tell us about your career goals and we'll create your personalized roadmap"
          />
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step Indicator */}
              <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full transition ${
                      s === step ? 'bg-indigo-600' : s < step ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Current Role *
                    </label>
                    <select
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="">Select your current role</option>
                      <option value="Junior Developer">Junior Developer</option>
                      <option value="Mid-level Developer">Mid-level Developer</option>
                      <option value="Senior Developer">Senior Developer</option>
                      <option value="Tech Lead">Tech Lead</option>
                      <option value="Engineering Manager">Engineering Manager</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Designer">Designer</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="Data Engineer">Data Engineer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="3"
                      min="0"
                      max="70"
                      className="input"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Career Goals */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Target Role (in 6 months) *
                    </label>
                    <select
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="">Select target role</option>
                      <option value="Mid-level Developer">Mid-level Developer</option>
                      <option value="Senior Developer">Senior Developer</option>
                      <option value="Tech Lead">Tech Lead</option>
                      <option value="Engineering Manager">Engineering Manager</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Architect">Architect</option>
                      <option value="Full-stack Developer">Full-stack Developer</option>
                      <option value="Staff Engineer">Staff Engineer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Hours Available Per Week
                    </label>
                    <select
                      name="hoursPerWeek"
                      value={formData.hoursPerWeek}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value={3}>3 hours</option>
                      <option value={5}>5 hours</option>
                      <option value={10}>10 hours</option>
                      <option value={15}>15 hours</option>
                      <option value={20}>20+ hours</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      💡 We'll create a personalized 180-day plan with daily tasks based on your available time.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Current Skills */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Current Skills (press Enter to add)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., React, TypeScript, Node.js"
                      onKeyDown={handleAddSkill}
                      className="input"
                    />
                  </div>

                  {formData.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-3">
                        Your Skills ({formData.skills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <div
                            key={skill}
                            className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                      ✓ Ready to generate your AI-powered roadmap! Click "Create Plan" to begin.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                )}
                <div className="flex-1"></div>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                    disabled={step === 1 ? !isStep1Valid : step === 2 ? !isStep2Valid : false}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Creating Plan...' : 'Create My Plan'}
                  </button>
                )}
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <p className="text-3xl mb-3">📅</p>
            <h4 className="font-semibold text-gray-900 mb-2">6-Month Roadmap</h4>
            <p className="text-sm text-gray-600">
              AI-generated OKRs aligned with your career goals
            </p>
          </Card>
          <Card>
            <p className="text-3xl mb-3">🎯</p>
            <h4 className="font-semibold text-gray-900 mb-2">Daily Tasks</h4>
            <p className="text-sm text-gray-600">
              180 actionable daily micro-tasks for continuous progress
            </p>
          </Card>
          <Card>
            <p className="text-3xl mb-3">📊</p>
            <h4 className="font-semibold text-gray-900 mb-2">Progress Reports</h4>
            <p className="text-sm text-gray-600">
              Weekly insights and HR-ready development summaries
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
