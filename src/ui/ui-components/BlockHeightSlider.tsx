interface BlockHeightSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function BlockHeightSlider({ value, onChange, min = 0.2, max = 5, step = 0.1 }: BlockHeightSliderProps) {
  return (
    <div className="resolution-slider">
      <div className="resolution-slider-label">
        <span>Blocks Height</span>
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
