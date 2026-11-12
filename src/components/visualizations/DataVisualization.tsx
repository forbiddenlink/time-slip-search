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
        backgroundColor: `${data.color}22`,
        borderWidth: 2,
        fill: type === 'line',
        tension: 0.4, // Smooth curves for line charts
        pointBackgroundColor: data.color,
        pointBorderColor: '#EFE6D2',
        pointHoverBackgroundColor: '#EFE6D2',
        pointHoverBorderColor: data.color,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
      easing: 'easeOutQuart' as const,
          },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#17140F',
        titleColor: '#EFE6D2',
        bodyColor: '#EFE6D2',
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
          color: 'rgba(23,20,15,0.15)',
          drawBorder: false,
        },
        ticks: {
          color: '#5A5144',
          font: {
            family: 'Libre Franklin, Arial, sans-serif',
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
          color: '#5A5144',
          font: {
            family: 'Libre Franklin, Arial, sans-serif',
            size: 10,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  }

  return (
    <figure>
      <figcaption className="font-display text-lg">{title}</figcaption>
      <div className="relative mt-3 h-[250px]">
        {type === 'line' ? (
          <Line data={chartData} options={options} aria-label={title} role="img" />
        ) : (
          <Bar data={chartData} options={options} aria-label={title} role="img" />
        )}
      </div>
      <p className="mt-2 ed-label text-faded">{data.label}</p>
    </figure>
  )
}
