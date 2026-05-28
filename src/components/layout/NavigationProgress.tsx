'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function NavigationProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [transitionDuration, setTransitionDuration] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []

    const s = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms)
      timers.current.push(t)
    }

    setWidth(0)
    setTransitionDuration(0)
    setOpacity(1)

    s(20,   () => { setWidth(30);  setTransitionDuration(200) })
    s(220,  () => { setWidth(62);  setTransitionDuration(450) })
    s(670,  () => { setWidth(82);  setTransitionDuration(4000) })
    s(950,  () => { setWidth(100); setTransitionDuration(200) })
    s(1180, () => setOpacity(0))
    s(1500, () => { setWidth(0); setTransitionDuration(0) })

    return () => timers.current.forEach(clearTimeout)
  }, [pathname])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200]"
      style={{ opacity, transition: 'opacity 320ms ease' }}
    >
      {/* Main progress bar */}
      <div
        style={{
          height: 3,
          width: `${width}%`,
          background: 'linear-gradient(90deg, #34d399 0%, #2dd4bf 50%, #22d3ee 100%)',
          boxShadow: '0 0 10px #34d39966, 0 0 22px #2dd4bf44',
          transitionProperty: 'width',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: `${transitionDuration}ms`,
        }}
      />
      {/* Glow layer */}
      <div
        style={{
          height: 1,
          width: `${width}%`,
          background: 'linear-gradient(90deg, #6ee7b7 0%, #5eead4 50%, #67e8f9 100%)',
          filter: 'blur(2px)',
          opacity: 0.8,
          transitionProperty: 'width',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: `${transitionDuration}ms`,
        }}
      />
    </div>
  )
}
