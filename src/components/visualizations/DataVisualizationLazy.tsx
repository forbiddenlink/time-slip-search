'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Lazy load the DataVisualization component (includes Chart.js ~200KB)
const DataVisualization = dynamic(
  () => import('./DataVisualization').then(mod => ({ default: mod.DataVisualization })),
  {
    loading: () => <DataVisualizationSkeleton />,
    ssr: false, // Chart.js doesn't work well with SSR
  }
)

interface ChartData {
  labels: string[]
  values: number[]
  label: string
  color: string
}

interface DataVisualizationLazyProps {
  data: ChartData
  type?: 'line' | 'bar'
  title: string
}

function DataVisualizationSkeleton() {
  return (
    <div className="glass-card p-6 border border-crt-light/20 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-aged-cream/10 rounded" />
        <div className="h-5 w-48 bg-aged-cream/10 rounded" />
      </div>
      <div className="h-[250px] relative bg-aged-cream/5 rounded flex items-center justify-center">
        <div className="text-aged-cream/40 led-text text-sm">
          Loading visualization...
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-3 w-24 bg-aged-cream/10 rounded" />
        <div className="h-3 w-32 bg-aged-cream/10 rounded" />
      </div>
    </div>
  )
}

export function DataVisualizationLazy(props: DataVisualizationLazyProps) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Load chart only when component is in view (intersection observer)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(`chart-${props.title}`)
    if (element) {
      observer.observe(element)
      return () => observer.disconnect()
    }

    return undefined
  }, [props.title])

  return (
    <div id={`chart-${props.title}`}>
      {shouldLoad ? (
        <DataVisualization {...props} />
      ) : (
        <DataVisualizationSkeleton />
      )}
    </div>
  )
}
