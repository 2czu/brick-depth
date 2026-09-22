import { converter, differenceEuclidean } from 'culori'
import paletteJson from '../../../palette.json'

interface PaletteEntry {
  legoId: number
  name: string
  rgb: [number, number, number]
}

const toLab = converter('lab')
const distance = differenceEuclidean('lab')

const paletteWithLab = paletteJson.colors.map((entry) => {
  const [r, g, b] = entry.rgb as [number, number, number]
  return {
    legoId: entry.lego_id,
    name: entry.name,
    rgb: [r, g, b] as [number, number, number],
    lab: toLab({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 }),
  }
})

export function findClosestPaletteEntry(r: number, g: number, b: number): PaletteEntry {
  const pixelLab = toLab({ mode: 'rgb', r, g, b })

  let closest: PaletteEntry = paletteWithLab[0]
  let closestDistance = Infinity

  for (const c of paletteWithLab) {
    const d = distance(pixelLab, c.lab)
    if (d < closestDistance) {
      closestDistance = d
      closest = c
    }
  }

  return closest
}

export function findClosestPaletteColor(r: number, g: number, b: number): [number, number, number] {
  return findClosestPaletteEntry(r, g, b).rgb
}

export interface ColorUsage {
  legoId: number
  name: string
  rgb: [number, number, number]
  count: number
}

export function computeColorUsage(width: number, height: number, data: Uint8ClampedArray): ColorUsage[] {
  const counts = new Map<number, ColorUsage>()

  for (let i = 0; i < width * height; i++) {
    const pixelIndex = i * 4
    const r = data[pixelIndex] / 255
    const g = data[pixelIndex + 1] / 255
    const b = data[pixelIndex + 2] / 255

    const entry = findClosestPaletteEntry(r, g, b)
    const existing = counts.get(entry.legoId)
    if (existing) {
      existing.count++
    } else {
      counts.set(entry.legoId, { legoId: entry.legoId, name: entry.name, rgb: entry.rgb, count: 1 })
    }
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count)
}
