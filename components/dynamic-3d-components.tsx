"use client"

import dynamic from "next/dynamic"
import { ClientOnlyWrapper } from "./client-only-wrapper"

const ThreeDHeroSlider = dynamic(() => import("./3d-hero-slider").then((mod) => ({ default: mod.ThreeDHeroSlider })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center rounded-lg">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-white/70">Loading 3D Experience...</p>
      </div>
    </div>
  ),
})

const Enhanced3DHero = dynamic(() => import("./enhanced-3d-hero").then((mod) => ({ default: mod.Enhanced3DHero })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center rounded-lg">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-white/70">Loading 3D Experience...</p>
      </div>
    </div>
  ),
})

const ThreeDLiveMap = dynamic(() => import("./3d-live-map").then((mod) => ({ default: mod.ThreeDLiveMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center rounded-lg">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-white/70">Loading 3D Map...</p>
      </div>
    </div>
  ),
})

const MobileOptimized3DMap = dynamic(
  () => import("./mobile-optimized-3d-map").then((mod) => ({ default: mod.MobileOptimized3DMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center rounded-lg">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white/70 text-sm">Loading Mobile 3D...</p>
        </div>
      </div>
    ),
  },
)

export function Dynamic3DHeroSlider() {
  return (
    <ClientOnlyWrapper>
      <ThreeDHeroSlider />
    </ClientOnlyWrapper>
  )
}

export function DynamicEnhanced3DHero() {
  return (
    <ClientOnlyWrapper>
      <Enhanced3DHero />
    </ClientOnlyWrapper>
  )
}

export function Dynamic3DLiveMap() {
  return (
    <ClientOnlyWrapper>
      <ThreeDLiveMap />
    </ClientOnlyWrapper>
  )
}

export function DynamicMobileOptimized3DMap() {
  return (
    <ClientOnlyWrapper>
      <MobileOptimized3DMap />
    </ClientOnlyWrapper>
  )
}
