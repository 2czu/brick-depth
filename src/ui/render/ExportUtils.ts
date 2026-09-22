import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Mesh, MeshStandardMaterial, Object3D } from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { findClosestPaletteColor } from './ColorUtils'

interface ExportPixelData {
  width: number
  height: number
  data: Uint8ClampedArray
  layers: number[][]
}

export async function exportMosaicToGLB(
  pixelData: ExportPixelData,
  layerSpacing: number,
  blockHeight: number,
  filename = 'brickdepth-mosaic.glb'
): Promise<void> {
  const { width, height, data, layers } = pixelData
  const dummy = new Object3D()
  const geometries: BufferGeometry[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4
      const r = data[pixelIndex] / 255
      const g = data[pixelIndex + 1] / 255
      const b = data[pixelIndex + 2] / 255

      dummy.position.set(x - width / 2, height / 2 - y, layers[y][x] * layerSpacing * blockHeight)
      dummy.scale.set(1, 1, blockHeight)
      dummy.updateMatrix()

      const geometry = new BoxGeometry(1, 1, 1)
      geometry.applyMatrix4(dummy.matrix)

      const [pr, pg, pb] = findClosestPaletteColor(r, g, b)
      const color = new Color(pr / 255, pg / 255, pb / 255)
      const vertexCount = geometry.attributes.position.count
      const colors = new Float32Array(vertexCount * 3)
      for (let i = 0; i < vertexCount; i++) {
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }
      geometry.setAttribute('color', new BufferAttribute(colors, 3))

      geometries.push(geometry)
    }
  }

  const merged = mergeGeometries(geometries, false)
  const material = new MeshStandardMaterial({ vertexColors: true })
  const mesh = new Mesh(merged, material)

  const exporter = new GLTFExporter()
  const result = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      mesh,
      (gltf) => resolve(gltf as ArrayBuffer),
      (error) => reject(error),
      { binary: true }
    )
  })

  const blob = new Blob([result], { type: 'model/gltf-binary' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
