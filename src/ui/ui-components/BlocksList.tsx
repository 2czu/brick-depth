import type { ColorUsage } from '../render/ColorUtils'
import { ColorSwatch } from './ColorSwatch'

interface BlocksListProps {
  colorUsage: ColorUsage[]
}

export function BlocksList({ colorUsage }: BlocksListProps) {
  if (colorUsage.length === 0) return null

  return (
    <div className="blocks-list">
      {colorUsage.map((usage) => (
        <ColorSwatch key={usage.legoId} usage={usage} />
      ))}
    </div>
  )
}
