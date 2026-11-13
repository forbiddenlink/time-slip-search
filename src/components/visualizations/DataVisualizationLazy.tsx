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
    <div className="border-y border-ink/40 py-4">
      <div className="ed-skeleton-line h-4 w-48" />
      <p className="mt-6 flex h-[250px] items-center justify-center ed-label text-faded">Loading chart</p>
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
