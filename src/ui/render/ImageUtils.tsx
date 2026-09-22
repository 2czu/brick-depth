
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  return { width: bitmap.width, height: bitmap.height }
}

export async function extractPixels(file:File, bricksWidth:number, bricksHeight:number, layers: number[][] ){
    const bitmap = await createImageBitmap(file)

    const canvas = document.createElement('canvas')
    canvas.width = bricksWidth
    canvas.height = bricksHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('could not get 2d canvas context')
    ctx.drawImage(bitmap, 0, 0, bricksWidth, bricksHeight)

    const imageData = ctx.getImageData(0, 0, bricksWidth, bricksHeight)
    return { width: bricksWidth, height: bricksHeight, data: imageData.data, layers }
}