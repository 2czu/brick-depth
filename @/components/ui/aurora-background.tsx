import type React from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  showRadialGradient?: boolean
  /** Animation duration in seconds. Default is 60s for subtle movement. Use lower values (10-20s) for more visible animation. */
  animationSpeed?: number
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  animationSpeed = 60,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-black text-slate-950",
          className,
        )}
        {...(props as AuroraBackgroundProps)}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              "--color-1": "#dc2626",
              "--color-2": "#ef4444",
              "--color-3": "#f87171",
              "--color-4": "#fb7185",
              "--color-5": "#fca5a5",
              "--black": "#171717",
              "--white": "#1a1a1a",
              "--transparent": "transparent",
              "--animation-speed": `${animationSpeed}s`,
            } as React.CSSProperties
          }
        >
          <div
            className={cn(
              `pointer-events-none absolute -inset-[10px] [background-image:var(--dark-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-50 blur-[10px] filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--color-1)_10%,var(--color-2)_15%,var(--color-3)_20%,var(--color-4)_25%,var(--color-5)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""]`,
              "after:[animation:aurora_var(--animation-speed)_linear_infinite]",
              showRadialGradient &&
                "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]",
            )}
          />
        </div>
        {children}
      </div>
    </main>
  )
}

export default function AuroraBackgroundDemo() {
  return (
    <AuroraBackground showRadialGradient={true} animationSpeed={15}>
      <div className="pointer-events-none" />
    </AuroraBackground>
  )
}
