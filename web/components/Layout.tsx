import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: ReactNode
  className?: string
}

export function Section({ children, className = '' }: SectionProps) {
  return (
    <section className={`py-12 ${className}`}>
      {children}
    </section>
  )
}
