// @refresh reset
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { ChartSkeleton } from './DashboardSkeletons'
import MonthlyReportExport from './MonthlyReportExport'
import './CustomAreaChart.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const CustomAreaChart = ({
  chartData,
  chartLoading,
  isLoading,
  activeTab,
  onTabChange,
  monthlyStatsData
}) => {
  const getDisplayData = () => chartData

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#64748b'
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        font: {
          family: "'Inter', sans-serif"
        },
        callbacks: {
          title: function (context) {
            return context[0].label
          },
          label: function (context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y
            }
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#94a3b8',
          padding: 8
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#64748b',
          padding: 8
        }
      }
    },
    spanGaps: true,
    elements: {
      line: {
        tension: 0.4,
        fill: true,
        borderWidth: 2.5
      },
      point: {
        radius: 4,
        hoverRadius: 7,
        borderWidth: 2,
        hoverBorderWidth: 3,
        backgroundColor: '#ffffff'
      }
    }
  }

  return (
    <div className="chart-wrapper">
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <>
          <div className="chart-header">
            <div className="chart-title-section">
              <h3 className="chart-title">Library Statistics</h3>
              <p className="chart-subtitle">Track your library&apos;s performance metrics</p>
            </div>
            <MonthlyReportExport monthlyStatsData={monthlyStatsData} />
          </div>

          <div className="chart-container-custom">
            {chartLoading ? (
              <div className="chart-loading-overlay">
                <div className="loading-spinner"></div>
                <p>Loading chart data...</p>
              </div>
            ) : (
              <Line data={getDisplayData()} options={chartOptions} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

CustomAreaChart.propTypes = {
  chartData: PropTypes.object.isRequired,
  chartLoading: PropTypes.bool,
  isLoading: PropTypes.bool,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  monthlyStatsData: PropTypes.array
}

export default CustomAreaChart
