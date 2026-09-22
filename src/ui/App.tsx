import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { LegoRenderer } from './render/LegoRenderer'
import { UploadPanel } from './ui-components/UploadPanel'
import { ResolutionSlider } from './ui-components/ResolutionSlider'
import { LayersSlider } from './ui-components/LayersSlider'
import { LayerSpacingSlider } from './ui-components/LayerSpacingSlider'
import { BlockHeightSlider } from './ui-components/BlockHeightSlider'
import { extractPixels, getImageDimensions } from './render/ImageUtils'
import { computeColorUsage } from './render/ColorUtils'
import { BlocksList } from './ui-components/BlocksList'
import { IntroScreen } from './ui-components/IntroScreen'
import { ExportButton } from './ui-components/ExportButton'
import { exportMosaicToGLB } from './render/ExportUtils'

const MAX_BRICKS_PER_SIDE = 512

function App() {
  const [serverReady, setServerReady] = useState(false)
  const [depthImageURL, changeDepthImage] = useState(new String())
  const [pixelData, setPixelData] = useState<{ width: number; height: number; data: Uint8ClampedArray; layers: number[][] } | null>(null)
  const [resolutionFactor, setResolutionFactor] = useState(0.2)
  const [nLayers, setNLayers] = useState(6)
  const [layerSpacing, setLayerSpacing] = useState(1)
  const [blockHeight, setBlockHeight] = useState(1)
  const [lastFile, setLastFile] = useState<File | null>(null)
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const handleIntroDone = useCallback(() => setServerReady(true), [])

  async function handleImageSelected(file: File) {
    setLastFile(file)
    setIsProcessing(true)

    try {
      const { width: naturalWidth, height: naturalHeight } = await getImageDimensions(file)
      setImageNaturalSize({ width: naturalWidth, height: naturalHeight })
      const bricksWidth = Math.min(MAX_BRICKS_PER_SIDE, Math.round(naturalWidth * resolutionFactor))
      const bricksHeight = Math.min(MAX_BRICKS_PER_SIDE, Math.round(naturalHeight * resolutionFactor))

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `http://localhost:8000/depth?bricks_width=${bricksWidth}&bricks_height=${bricksHeight}&n_layers=${nLayers}`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (response.ok)
      {
        const data = await response.json()
        // data.depth_preview = la data url du png
        // data.layers = l'array 2d des couches

        // URL.revokeObjectURL(depthImageURL.toString())
        // const depthBlob = await response.blob();
        // const depthUrl = URL.createObjectURL(depthBlob);
        changeDepthImage(data.depth_preview)

        const extracted = await extractPixels(file, bricksWidth, bricksHeight, data.layers)
        setPixelData(extracted)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  async function onExport() {
    if (!pixelData) return
    setIsExporting(true)

    try {
      await exportMosaicToGLB(pixelData, layerSpacing, blockHeight)
    } catch (err) {
      console.error('export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (lastFile) handleImageSelected(lastFile)
  }, [resolutionFactor, nLayers])

  const colorUsage = useMemo(
    () => (pixelData ? computeColorUsage(pixelData.width, pixelData.height, pixelData.data) : []),
    [pixelData]
  )

  return (
    <>
      <main className="app pointer-events-auto">
        <div className="workspace">
          <div className="left-panel">
            <UploadPanel onImageSelected={handleImageSelected} />
            <ResolutionSlider value={resolutionFactor} onChange={setResolutionFactor} naturalSize={imageNaturalSize} />
            <LayersSlider value={nLayers} onChange={setNLayers} />
            <LayerSpacingSlider value={layerSpacing} onChange={setLayerSpacing} />
            <BlockHeightSlider value={blockHeight} onChange={setBlockHeight} />
            <BlocksList colorUsage={colorUsage} />
          </div>
          <div className="scene-panel">
            {pixelData && <ExportButton onClick={onExport} isExporting={isExporting} />}
            <LegoRenderer pixelData={pixelData} layerSpacing={layerSpacing} blockHeight={blockHeight} />
          </div>
        </div>
        {depthImageURL.toString() && (
          <img src={depthImageURL.toString()} alt="depth map" className="depth-preview" />
        )}
        {isProcessing && <div className="loading-spinner" aria-label="chargement" />}
      </main>
      {!serverReady && <IntroScreen onDone={handleIntroDone} />}
    </>
  )
}

export default App
