'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartData {
  labels: string[]
  values: number[]
  label: string
  color: string
}

interface DataVisualizationProps {
  data: ChartData
  type?: 'line' | 'bar'
  title: string
}

export function DataVisualization({ data, type = 'line', title }: Readonly<DataVisualizationProps>) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.label,
        data: data.values,
        borderColor: data.color,
        backgroundColor: `${data.color}33`, // 20% opacity
        borderWidth: 2,
        fill: type === 'line',
        tension: 0.4, // Smooth curves for line charts
        pointBackgroundColor: data.color,
        pointBorderColor: '#1a1a1a',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: data.color,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#e0d5c7',
        bodyColor: '#e0d5c7',
        borderColor: data.color,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => `${data.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#2a2a2a',
          drawBorder: false,
        },
        ticks: {
          color: '#e0d5c788',
          font: {
            family: 'monospace',
            size: 10,
          },
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#e0d5c788',
          font: {
            family: 'monospace',
            size: 10,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  }

  return (
    <div className="glass-card p-6 border border-crt-light/20">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">📊</span>
        <h3 className="text-aged-cream text-lg led-text tracking-wide">{title}</h3>
      </div>
      <div className="h-[250px] relative">
        {type === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-aged-cream/40 led-text">
        <span>{data.labels.length} data points</span>
        <span className="text-phosphor-teal">{data.label}</span>
      </div>
    </div>
  )
}
