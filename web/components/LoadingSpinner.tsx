interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size]

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClass} border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  )
}
