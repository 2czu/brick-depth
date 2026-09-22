import { useEffect, useState } from 'react'
import introImage from '../../../z.png'

const IMAGE_FADE_IN_MS = 1500
const REVEAL_DURATION_MS = 1200

interface IntroScreenProps {
  onDone: () => void
}

export function IntroScreen({ onDone }: IntroScreenProps) {
  const [imageVisible, setImageVisible] = useState(false)
  const [revealing, setRevealing] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setImageVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function pollHealth() {
      while (!cancelled) {
        try {
          const res = await fetch('http://localhost:8000/health')
          if (res.ok) {
            if (!cancelled) setRevealing(true)
            return
          }
        } catch {
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    pollHealth()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!revealing) return
    const t = setTimeout(onDone, REVEAL_DURATION_MS)
    return () => clearTimeout(t)
  }, [revealing, onDone])

  return (
    <div
      className={`intro-overlay${revealing ? ' revealing' : ''}`}
      style={{ '--reveal-duration': `${REVEAL_DURATION_MS}ms` } as React.CSSProperties}
    >
      <img
        src={introImage}
        alt=""
        className="intro-image"
        style={{ opacity: imageVisible ? 1 : 0, transitionDuration: `${IMAGE_FADE_IN_MS}ms` }}
      />
      {!revealing && <div className="loading-spinner" aria-label="chargement" />}
    </div>
  )
}
