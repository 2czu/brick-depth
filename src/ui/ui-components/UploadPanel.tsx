import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'

const MAX_FILE_SIZE_MB = 20

interface UploadPanelProps {
  onImageSelected: (file: File) => void
}

export function UploadPanel({ onImageSelected }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image trop lourde (max ${MAX_FILE_SIZE_MB} Mo)`)
      return
    }

    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
    onImageSelected(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    acceptFile(event.dataTransfer.files[0])
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0])
  }

  return (
    <div
      className={`upload-panel${isDragging ? ' dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="upload-input"
        onChange={handleInputChange}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="preview" className="upload-preview" />
      ) : (
        <div className="upload-placeholder">
          <p>Drop your image here</p>
          <p className="upload-hint">or click to upload one</p>
        </div>
      )}
      {error && <p className="upload-error">{error}</p>}
    </div>
  )
}
