'use client'

import { useEffect, useRef } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate'

/** Hook for animated list containers (incidents, processes, etc.) */
export function useAutoAnimateList<T extends HTMLElement = HTMLDivElement>() {
  const [parent] = useAutoAnimate<T>({
    duration: 320,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  })
  return parent
}

/** Attach auto-animate to an existing ref */
export function useAutoAnimateRef<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useAutoAnimate(ref, {
    duration: 320,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  })
  return ref
}
