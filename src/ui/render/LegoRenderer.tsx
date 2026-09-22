import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, SSAO } from '@react-three/postprocessing'
import { useEffect, useRef} from 'react'
import { Color, Object3D, type InstancedMesh, type Mesh } from 'three'
import { findClosestPaletteColor } from './ColorUtils'

function SpinningCube() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.7
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhongMaterial color="#FF00000" />
    </mesh>
  )
}

function PixelBlocks({width, height, data, layers, layerSpacing, blockHeight} : {width:number, height:number, data:Uint8ClampedArray, layers: number[][], layerSpacing: number, blockHeight: number}) {
  const meshRef = useRef<InstancedMesh>(null)
  const count = width * height
  const dummy = new Object3D()

  useEffect(() => {
    if (!meshRef.current) return

    let i = 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4
        const r = data[pixelIndex] / 255
        const g = data[pixelIndex + 1] / 255
        const b = data[pixelIndex + 2] / 255

        dummy.position.set(x - width / 2, height / 2 - y, layers[y][x] * layerSpacing * blockHeight)
        dummy.scale.set(1, 1, blockHeight)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)

        const [pr, pg, pb] = findClosestPaletteColor(r, g, b)
        meshRef.current.setColorAt(i, new Color(pr / 255, pg / 255, pb / 255))

        i++
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [data, width, height, layers, layerSpacing, blockHeight])

  return (
    <instancedMesh castShadow receiveShadow ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}

interface LegoRendererProps {
  pixelData: { width: number; height: number; data: Uint8ClampedArray; layers: number [][]} | null
  layerSpacing: number
  blockHeight: number
}

export function LegoRenderer({pixelData, layerSpacing, blockHeight} : LegoRendererProps) {

  return (
    <Canvas shadows style={{ width: '100%', height: '100%', backgroundColor:'#000000' }} camera={{ position: [0, 0, 160], fov: 50 }}>
      <ambientLight intensity={0.6} />
      {pixelData && <directionalLight castShadow position={[pixelData.width / 2, pixelData.height / 2, 10]} intensity={1} />}
      {pixelData && <PixelBlocks width={pixelData.width} height={pixelData.height} data={pixelData.data} layers={pixelData.layers} layerSpacing={layerSpacing} blockHeight={blockHeight} />}
      {!pixelData && <SpinningCube></SpinningCube>}
      <OrbitControls/>
      <EffectComposer enableNormalPass>
        <SSAO radius={0.3} intensity={4} bias={0.05} luminanceInfluence={0.4} />
      </EffectComposer>
    </Canvas>
  )
}
