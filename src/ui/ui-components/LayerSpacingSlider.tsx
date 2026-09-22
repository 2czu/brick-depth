interface LayerSpacingSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function LayerSpacingSlider({ value, onChange, min = 0.2, max = 10, step = 0.1 }: LayerSpacingSliderProps) {
  return (
    <div className="resolution-slider">
      <div className="resolution-slider-label">
        <span>Space Between Layers</span>
        <span>{value.toFixed(1)}x</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
