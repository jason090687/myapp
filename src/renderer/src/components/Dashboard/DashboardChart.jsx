import { Bar } from 'react-chartjs-2'
import MonthSelector from './MonthSelector'
import { ChartSkeleton } from './DashboardSkeletons'
import { FaFileDownload } from 'react-icons/fa'
import ChartDataLabels from 'chartjs-plugin-datalabels'

const DashboardChart = ({
  chartData,
  chartOptions,
  chartLoading,
  selectedDate,
  onMonthChange,
  onGeneratePDF,
  isLoading
}) => {
  return (
    <div className="chart">
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <>
          <div className="chart-header">
            <MonthSelector
              currentMonth={selectedDate.getMonth()}
              currentYear={selectedDate.getFullYear()}
              onMonthChange={onMonthChange}
            />
            <button className="generate-report-btn" onClick={onGeneratePDF} disabled={chartLoading}>
              <FaFileDownload />
              Generate Report
            </button>
          </div>
          <div className="chart-container" style={{ height: '400px' }}>
            {chartLoading ? (
              <div className="chart-loading-overlay">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardChart
