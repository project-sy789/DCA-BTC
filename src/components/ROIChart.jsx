import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import PropTypes from 'prop-types';
import { calculateCumulativeData } from '../utils/chartUtils';
import './ROIChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const ROIChart = ({ purchases, currentBTCPrice }) => {
  const [timeRange, setTimeRange] = useState('ALL');

  // Get cumulative data
  const allData = calculateCumulativeData(purchases, currentBTCPrice);

  // Calculate ROI for each data point
  const dataWithROI = allData.map(item => ({
    ...item,
    roi: item.cumulativeInvestment > 0 
      ? ((item.portfolioValue - item.cumulativeInvestment) / item.cumulativeInvestment) * 100 
      : 0,
    profit: item.portfolioValue - item.cumulativeInvestment
  }));

  // Filter data based on selected time range
  const filterDataByTimeRange = (data, range) => {
    if (range === 'ALL' || data.length === 0) return data;

    const now = new Date();
    const cutoffDate = new Date();

    switch (range) {
      case '1D':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'YTD':
        cutoffDate.setMonth(0);
        cutoffDate.setDate(1);
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredData = filterDataByTimeRange(dataWithROI, timeRange);

  // Prepare chart data
  const chartData = {
    labels: filteredData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'ROI (%)',
        data: filteredData.map(item => item.roi),
        borderColor: function(context) {
          if (!context.parsed) return '#10b981';
          const value = context.parsed.y;
          return value >= 0 ? '#10b981' : '#ef4444';
        },
        backgroundColor: function(context) {
          if (!context.parsed) return 'rgba(16, 185, 129, 0.1)';
          const value = context.parsed.y;
          return value >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        },
        segment: {
          borderColor: function(context) {
            if (!context.p1 || !context.p1.parsed) return '#10b981';
            const value = context.p1.parsed.y;
            return value >= 0 ? '#10b981' : '#ef4444';
          }
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: function(context) {
          if (!context.parsed) return '#10b981';
          const value = context.parsed.y;
          return value >= 0 ? '#10b981' : '#ef4444';
        },
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e0e0e0',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'ROI Timeline - ผลตอบแทนการลงทุน (เลื่อนเมาส์เพื่อซูม, ลากเพื่อเลื่อน)',
        color: '#e0e0e0',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#e0e0e0',
        bodyColor: '#e0e0e0',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const dataPoint = filteredData[context.dataIndex];
            const roi = dataPoint.roi;
            const profit = dataPoint.profit;
            const roiColor = roi >= 0 ? '🟢' : '🔴';
            
            return [
              `${roiColor} ROI: ${roi.toFixed(2)}%`,
              `กำไร/ขาดทุน: ฿${profit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              `เงินลงทุน: ฿${dataPoint.cumulativeInvestment.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
              `มูลค่าปัจจุบัน: ฿${dataPoint.portfolioValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
            ];
          }
        },
        borderColor: function(context) {
          if (!context.tooltip || !context.tooltip.dataPoints || !context.tooltip.dataPoints[0]) {
            return '#10b981';
          }
          const value = context.tooltip.dataPoints[0].parsed.y;
          return value >= 0 ? '#10b981' : '#ef4444';
        }
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1
          },
          pinch: {
            enabled: true
          },
          mode: 'xy'
        },
        pan: {
          enabled: true,
          mode: 'xy'
        },
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: 'original', max: 'original' }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#e0e0e0'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#e0e0e0',
          callback: function(value) {
            return value.toFixed(2) + '%';
          }
        },
        grid: {
          color: function(context) {
            if (context.tick.value === 0) {
              return 'rgba(255, 255, 255, 0.3)';
            }
            return 'rgba(255, 255, 255, 0.1)';
          },
          lineWidth: function(context) {
            if (context.tick.value === 0) {
              return 2;
            }
            return 1;
          }
        }
      }
    }
  };

  // Time range buttons
  const timeRanges = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

  // Calculate current ROI
  const currentROI = filteredData.length > 0 
    ? filteredData[filteredData.length - 1].roi 
    : 0;
  const currentProfit = filteredData.length > 0 
    ? filteredData[filteredData.length - 1].profit 
    : 0;

  // Show message if no data
  if (allData.length === 0) {
    return (
      <div className="roi-chart">
        <div className="no-data-message">
          <p>ยังไม่มีข้อมูลการซื้อ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="roi-chart">
      <div className="chart-header">
        <div className="roi-summary">
          <div className={`roi-value ${currentROI >= 0 ? 'positive' : 'negative'}`}>
            <span className="roi-label">ROI ปัจจุบัน:</span>
            <span className="roi-number">
              {currentROI >= 0 ? '🟢' : '🔴'} {currentROI.toFixed(2)}%
            </span>
          </div>
          <div className={`profit-value ${currentProfit >= 0 ? 'positive' : 'negative'}`}>
            <span className="profit-label">กำไร/ขาดทุน:</span>
            <span className="profit-number">
              ฿{currentProfit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="chart-controls">
          {timeRanges.map(range => (
            <button
              key={range}
              className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

ROIChart.propTypes = {
  purchases: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      investmentAmount: PropTypes.number.isRequired,
      btcPrice: PropTypes.number.isRequired,
      btcReceived: PropTypes.number.isRequired
    })
  ).isRequired,
  currentBTCPrice: PropTypes.number.isRequired
};

export default ROIChart;
