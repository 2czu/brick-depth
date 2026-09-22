interface LayersSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function LayersSlider({ value, onChange, min = 3, max = 10 }: LayersSliderProps) {
  return (
    <div className="resolution-slider">
      <div className="resolution-slider-label">
        <span>Layers</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
