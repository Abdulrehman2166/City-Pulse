"use client"

import dynamic from 'next/dynamic'
const GalaxyBackground = dynamic(() => import('./galaxy-background'), { ssr: false })

export default function GalaxyLoader() {
  return <GalaxyBackground />
}
