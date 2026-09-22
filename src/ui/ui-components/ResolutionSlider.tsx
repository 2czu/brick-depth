import { useState } from 'react'

interface ResolutionSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  naturalSize?: { width: number; height: number } | null
}

export function ResolutionSlider({
  value,
  onChange,
  min = 0.01,
  max = 1,
  step = 0.01,
  label = 'Resolution',
  naturalSize = null,
}: ResolutionSliderProps) {
  const [mode, setMode] = useState<'percent' | 'pixels'>('percent')
  const canUsePixels = naturalSize !== null
  const longestSide = naturalSize ? Math.max(naturalSize.width, naturalSize.height) : 0

  const displayValue =
    mode === 'pixels' && canUsePixels ? `${Math.round(value * longestSide)}px` : `${Math.round(value * 100)}%`

  const handlePixelChange = (px: number) => {
    if (!canUsePixels) return
    onChange(Math.min(1, Math.max(min, px / longestSide)))
  }

  return (
    <div className="resolution-slider">
      <div className="resolution-slider-label">
        <span>
          {label}
          {canUsePixels && (
            <span className="resolution-mode-toggle">
              <button
                type="button"
                className={mode === 'percent' ? 'active' : ''}
                onClick={() => setMode('percent')}
              >
                %
              </button>
              <button
                type="button"
                className={mode === 'pixels' ? 'active' : ''}
                onClick={() => setMode('pixels')}
              >
                px
              </button>
            </span>
          )}
        </span>
        <span>{displayValue}</span>
      </div>
      {mode === 'pixels' && canUsePixels ? (
        <input
          type="range"
          min={1}
          max={longestSide}
          step={1}
          value={Math.round(value * longestSide)}
          onChange={(event) => handlePixelChange(Number(event.target.value))}
        />
      ) : (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      )}
    </div>
  )
}
