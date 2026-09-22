import type { ColorUsage } from '../render/ColorUtils'

interface ColorSwatchProps {
  usage: ColorUsage
}

export function ColorSwatch({ usage }: ColorSwatchProps) {
  const [r, g, b] = usage.rgb

  return (
    <div className="color-swatch">
      <div className="color-swatch-chip" style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }} />
      <span className="color-swatch-name">{usage.name}</span>
      <span className="color-swatch-count">{usage.count}</span>
    </div>
  )
}
