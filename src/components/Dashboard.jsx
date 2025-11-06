import { useMemo } from 'react'
import PropTypes from 'prop-types'
import StatCard from './StatCard'
import './Dashboard.css'

/**
 * Dashboard component - Displays key statistics about the DCA Bitcoin portfolio
 * @param {Array} purchases - Array of purchase objects
 * @param {number} currentBTCPrice - Current Bitcoin price
 */
function Dashboard({ purchases, currentBTCPrice }) {
  // Calculate all statistics using useMemo for optimization
  const stats = useMemo(() => {
    // Handle empty purchases array
    if (!purchases || purchases.length === 0) {
      return {
        totalInvestment: 0,
        totalBTC: 0,
        costBasis: 0,
        portfolioValue: 0,
        profitLoss: 0,
        profitLossPercent: 0
      }
    }

    // Calculate total investment (sum of all investmentAmount)
    const totalInvestment = purchases.reduce((sum, purchase) => {
      return sum + (purchase.investmentAmount || 0)
    }, 0)

    // Calculate total BTC (sum of all btcReceived)
    const totalBTC = purchases.reduce((sum, purchase) => {
      return sum + (purchase.btcReceived || 0)
    }, 0)

    // Calculate cost basis (average price paid per BTC)
    // Handle division by zero
    const costBasis = totalBTC > 0 ? totalInvestment / totalBTC : 0

    // Calculate portfolio value (totalBTC * currentBTCPrice)
    const portfolioValue = totalBTC * currentBTCPrice

    // Calculate profit/loss
    const profitLoss = portfolioValue - totalInvestment

    // Calculate profit/loss percentage
    // Handle division by zero
    const profitLossPercent = totalInvestment > 0 
      ? (profitLoss / totalInvestment) * 100 
      : 0

    return {
      totalInvestment,
      totalBTC,
      costBasis,
      portfolioValue,
      profitLoss,
      profitLossPercent
    }
  }, [purchases, currentBTCPrice])

  // Display message when no data exists
  if (!purchases || purchases.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-empty">
          <p>ยังไม่มีข้อมูลการซื้อ กรุณาเพิ่มข้อมูลการซื้อ Bitcoin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <StatCard
          icon="💰"
          title="เงินลงทุนทั้งหมด"
          value={stats.totalInvestment.toLocaleString('th-TH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
          unit="บาท"
        />
        
        <StatCard
          icon="₿"
          title="Bitcoin ทั้งหมด"
          value={stats.totalBTC.toLocaleString('th-TH', { 
            minimumFractionDigits: 8, 
            maximumFractionDigits: 8 
          })}
          unit="BTC"
        />
        
        <StatCard
          icon="📊"
          title="ราคาต้นทุนเฉลี่ย"
          value={stats.costBasis.toLocaleString('th-TH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
          unit="บาท"
        />
        
        <StatCard
          icon="💎"
          title="มูลค่าพอร์ตปัจจุบัน"
          value={stats.portfolioValue.toLocaleString('th-TH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
          unit="บาท"
        />
        
        <StatCard
          icon={stats.profitLoss >= 0 ? "📈" : "📉"}
          title="กำไร/ขาดทุน"
          value={`${stats.profitLoss >= 0 ? '+' : ''}${stats.profitLossPercent.toLocaleString('th-TH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}%`}
          unit={`(${stats.profitLoss >= 0 ? '+' : ''}${stats.profitLoss.toLocaleString('th-TH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })} บาท)`}
          isProfit={stats.profitLoss >= 0}
        />
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  purchases: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    investmentAmount: PropTypes.number,
    btcPrice: PropTypes.number,
    btcReceived: PropTypes.number
  })).isRequired,
  currentBTCPrice: PropTypes.number.isRequired
}

export default Dashboard
