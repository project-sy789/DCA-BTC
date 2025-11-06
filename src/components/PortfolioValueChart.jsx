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
import annotationPlugin from 'chartjs-plugin-annotation';
import PropTypes from 'prop-types';
import { calculateCumulativeData } from '../utils/chartUtils';
import './PortfolioValueChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  annotationPlugin
);

const PortfolioValueChart = ({ purchases, currentBTCPrice, costBasis }) => {
  const [timeRange, setTimeRange] = useState('ALL');

  // Get cumulative data
  const allData = calculateCumulativeData(purchases, currentBTCPrice);

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
        cutoffDate.setMonth(0); // January
        cutoffDate.setDate(1); // 1st day
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

  const cumulativeData = filterDataByTimeRange(allData, timeRange);

  // Prepare chart data with two datasets
  const chartData = {
    labels: cumulativeData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'เงินลงทุนสะสม',
        data: cumulativeData.map(item => item.cumulativeInvestment),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'มูลค่าพอร์ตสะสม',
        data: cumulativeData.map(item => item.portfolioValue),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false
      }
    ]
  };

  // Chart options with dark mode styling and zoom
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
        text: 'มูลค่าพอร์ตโฟลิโอ (เลื่อนเมาส์เพื่อซูม, ลากเพื่อเลื่อน)',
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
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ฿${context.parsed.y.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      },
      annotation: {
        annotations: costBasis && costBasis > 0 ? {
          averagePriceLine: {
            type: 'line',
            yMin: costBasis,
            yMax: costBasis,
            borderColor: '#f7931a',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: `ราคาเฉลี่ย: ฿${costBasis.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              enabled: true,
              position: 'end',
              backgroundColor: 'rgba(247, 147, 26, 0.8)',
              color: '#ffffff',
              font: {
                size: 11,
                weight: 'bold'
              },
              padding: 4
            }
          }
        } : {}
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
            return '฿' + value.toLocaleString('th-TH');
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  // Time range buttons
  const timeRanges = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

  // Show message if no data
  if (allData.length === 0) {
    return (
      <div className="portfolio-value-chart">
        <div className="no-data-message">
          <p>ยังไม่มีข้อมูลการซื้อ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-value-chart">
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
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

PortfolioValueChart.propTypes = {
  purchases: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      investmentAmount: PropTypes.number.isRequired,
      btcPrice: PropTypes.number.isRequired,
      btcReceived: PropTypes.number.isRequired
    })
  ).isRequired,
  currentBTCPrice: PropTypes.number.isRequired,
  costBasis: PropTypes.number
};

export default PortfolioValueChart;
