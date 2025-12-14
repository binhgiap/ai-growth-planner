interface StepperProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {steps.map((_, index) => (
          <div key={index} className="flex-1">
            <div
              className={`h-2 rounded-full transition ${
                index + 1 === currentStep
                  ? 'bg-indigo-600'
                  : index + 1 < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        {steps.map((step, index) => (
          <span
            key={step}
            onClick={() => onStepClick?.(index + 1)}
            className={`cursor-pointer transition ${
              index + 1 === currentStep ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
