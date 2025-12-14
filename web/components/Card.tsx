import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
}

export function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="text-gray-700">{children}</div>
}
