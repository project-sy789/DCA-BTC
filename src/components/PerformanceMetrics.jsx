import { useMemo } from 'react'
import PropTypes from 'prop-types'
import './PerformanceMetrics.css'

/**
 * PerformanceMetrics component - Displays advanced performance analytics
 * @param {Array} purchases - Array of purchase objects
 * @param {number} currentBTCPrice - Current Bitcoin price
 */
function PerformanceMetrics({ purchases, currentBTCPrice }) {
  const metrics = useMemo(() => {
    if (!purchases || purchases.length === 0) {
      return null
    }

    // Sort purchases by date
    const sortedPurchases = [...purchases].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    )

    // Calculate portfolio values at each purchase date
    const portfolioHistory = []
    let cumulativeBTC = 0
    let cumulativeInvestment = 0

    sortedPurchases.forEach(purchase => {
      cumulativeBTC += purchase.btcReceived
      cumulativeInvestment += purchase.investmentAmount
      const portfolioValue = cumulativeBTC * purchase.btcPrice

      portfolioHistory.push({
        date: new Date(purchase.date),
        portfolioValue,
        investment: cumulativeInvestment,
        btcPrice: purchase.btcPrice,
        cumulativeBTC
      })
    })

    // Add current value
    const currentPortfolioValue = cumulativeBTC * currentBTCPrice
    portfolioHistory.push({
      date: new Date(),
      portfolioValue: currentPortfolioValue,
      investment: cumulativeInvestment,
      btcPrice: currentBTCPrice,
      cumulativeBTC
    })

    // 1. Calculate Maximum Drawdown
    // Calculate based on portfolio return percentage (peak-to-trough)
    let maxDrawdown = 0
    let peakReturn = -Infinity

    portfolioHistory.forEach(point => {
      const returnPct = ((point.portfolioValue - point.investment) / point.investment) * 100

      if (returnPct > peakReturn) {
        peakReturn = returnPct
      }

      const drawdown = peakReturn - returnPct
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    // 2. Calculate Sharpe Ratio
    // Calculate using individual purchase returns
    let sharpeRatio = 0

    if (sortedPurchases.length > 1) {
      // Calculate individual purchase returns
      const purchaseReturns = sortedPurchases.map(purchase => {
        const currentValue = purchase.btcReceived * currentBTCPrice
        const returnPct = ((currentValue - purchase.investmentAmount) / purchase.investmentAmount) * 100
        return returnPct
      })

      if (purchaseReturns.length > 0) {
        // Calculate average return and standard deviation
        const avgReturn = purchaseReturns.reduce((sum, r) => sum + r, 0) / purchaseReturns.length
        const variance = purchaseReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / purchaseReturns.length
        const stdDev = Math.sqrt(variance)

        // Sharpe Ratio (assuming risk-free rate = 0)
        if (stdDev > 0) {
          sharpeRatio = avgReturn / stdDev
        }
      }
    }

    // 3. Calculate Time-Weighted Return (TWR)
    // Calculate using geometric mean of period returns
    let timeWeightedReturn = 0
    let twrLabel = 'ผลตอบแทนรวม'

    if (sortedPurchases.length > 0) {
      const firstDate = new Date(sortedPurchases[0].date)
      const lastDate = new Date()
      const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24)

      if (daysDiff > 0 && portfolioHistory.length > 1) {
        // Calculate period returns using geometric mean
        let cumulativeReturn = 1

        for (let i = 1; i < portfolioHistory.length; i++) {
          const prevPrice = portfolioHistory[i - 1].btcPrice
          const currentPrice = portfolioHistory[i].btcPrice

          if (prevPrice > 0) {
            const periodReturn = currentPrice / prevPrice
            cumulativeReturn *= periodReturn
          }
        }

        const totalReturn = (cumulativeReturn - 1) * 100

        // Only annualize if we have at least 30 days
        if (daysDiff >= 30) {
          const annualizedReturn = (Math.pow(cumulativeReturn, 365 / daysDiff) - 1) * 100

          if (isFinite(annualizedReturn) && Math.abs(annualizedReturn) <= 1000) {
            timeWeightedReturn = annualizedReturn
            twrLabel = 'ผลตอบแทนต่อปี (Annualized)'
          } else {
            timeWeightedReturn = totalReturn
            twrLabel = 'ผลตอบแทนรวม (Total Return)'
          }
        } else {
          timeWeightedReturn = totalReturn
          twrLabel = 'ผลตอบแทนรวม (Total Return)'
        }
      }
    }

    // 4. Calculate Money-Weighted Return (MWR)
    // MWR considers timing and size of cash flows
    let moneyWeightedReturn = 0
    let mwrLabel = 'ผลตอบแทนต่อปี'
    if (cumulativeInvestment > 0 && sortedPurchases.length > 0) {
      const totalReturn = currentPortfolioValue - cumulativeInvestment
      const simpleReturn = totalReturn / cumulativeInvestment

      // Calculate weighted average holding period
      let weightedDays = 0
      sortedPurchases.forEach(purchase => {
        const daysSincePurchase = (new Date() - new Date(purchase.date)) / (1000 * 60 * 60 * 24)
        weightedDays += (purchase.investmentAmount / cumulativeInvestment) * daysSincePurchase
      })

      // Only annualize if we have at least 30 days average holding period
      if (weightedDays >= 30 && weightedDays < 36500 && simpleReturn > -0.99) {
        const annualizedReturn = Math.pow(1 + simpleReturn, 365 / weightedDays) - 1

        // Cap extreme values
        if (isFinite(annualizedReturn) && Math.abs(annualizedReturn * 100) <= 1000) {
          moneyWeightedReturn = annualizedReturn * 100
          mwrLabel = 'ผลตอบแทนต่อปี (Annualized)'
        } else {
          moneyWeightedReturn = simpleReturn * 100
          mwrLabel = 'ผลตอบแทนรวม (Total Return)'
        }
      } else {
        moneyWeightedReturn = simpleReturn * 100
        mwrLabel = 'ผลตอบแทนรวม (Total Return)'
      }
    }

    return {
      sharpeRatio,
      maxDrawdown,
      timeWeightedReturn,
      moneyWeightedReturn,
      twrLabel,
      mwrLabel,
      totalInvestment: cumulativeInvestment,
      currentValue: currentPortfolioValue
    }
  }, [purchases, currentBTCPrice])

  if (!metrics) {
    return (
      <div className="performance-metrics">
        <h2>ตัวชี้วัดประสิทธิภาพขั้นสูง</h2>
        <div className="no-data-message">
          <p>ต้องมีข้อมูลการซื้ออย่างน้อย 1 ครั้งเพื่อคำนวณตัวชี้วัด</p>
        </div>
      </div>
    )
  }

  return (
    <div className="performance-metrics">
      <h2>ตัวชี้วัดประสิทธิภาพขั้นสูง</h2>

      <div className="metrics-grid">
        {/* Sharpe Ratio */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📊</span>
            <h3>Sharpe Ratio</h3>
          </div>
          <div className="metric-value-large">
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="metric-description">
            ผลตอบแทนที่ปรับด้วยความเสี่ยง
          </div>
          <div className="metric-interpretation">
            {metrics.sharpeRatio > 2 && '🟢 ดีมาก (>2)'}
            {metrics.sharpeRatio > 1 && metrics.sharpeRatio <= 2 && '🟡 ดี (1-2)'}
            {metrics.sharpeRatio > 0 && metrics.sharpeRatio <= 1 && '🟠 พอใช้ (0-1)'}
            {metrics.sharpeRatio <= 0 && '🔴 ต่ำกว่ามาตรฐาน (<0)'}
          </div>
        </div>

        {/* Maximum Drawdown */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📉</span>
            <h3>Maximum Drawdown</h3>
          </div>
          <div className="metric-value-large drawdown">
            -{metrics.maxDrawdown.toFixed(2)}%
          </div>
          <div className="metric-description">
            ขาดทุนสูงสุดที่เคยเกิดขึ้น
          </div>
          <div className="metric-interpretation">
            {metrics.maxDrawdown < 10 && '🟢 ความเสี่ยงต่ำ (<10%)'}
            {metrics.maxDrawdown >= 10 && metrics.maxDrawdown < 25 && '🟡 ความเสี่ยงปานกลาง (10-25%)'}
            {metrics.maxDrawdown >= 25 && metrics.maxDrawdown < 50 && '🟠 ความเสี่ยงสูง (25-50%)'}
            {metrics.maxDrawdown >= 50 && '🔴 ความเสี่ยงสูงมาก (>50%)'}
          </div>
        </div>

        {/* Time-Weighted Return */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">⏱️</span>
            <h3>Time-Weighted Return</h3>
          </div>
          <div className={`metric-value-large ${metrics.timeWeightedReturn >= 0 ? 'positive' : 'negative'}`}>
            {metrics.timeWeightedReturn >= 0 ? '+' : ''}{metrics.timeWeightedReturn.toFixed(2)}%
          </div>
          <div className="metric-description">
            {metrics.twrLabel} (ไม่รวมผลกระทบจากการเพิ่มเงิน)
          </div>
          <div className="metric-info">
            วัดประสิทธิภาพของการลงทุนโดยไม่คำนึงถึงเวลาที่เพิ่มเงิน
          </div>
        </div>

        {/* Money-Weighted Return */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💵</span>
            <h3>Money-Weighted Return</h3>
          </div>
          <div className={`metric-value-large ${metrics.moneyWeightedReturn >= 0 ? 'positive' : 'negative'}`}>
            {metrics.moneyWeightedReturn >= 0 ? '+' : ''}{metrics.moneyWeightedReturn.toFixed(2)}%
          </div>
          <div className="metric-description">
            {metrics.mwrLabel} (รวมผลกระทบจากการเพิ่มเงิน)
          </div>
          <div className="metric-info">
            วัดผลตอบแทนจริงที่คุณได้รับจากเงินที่ลงทุนไป
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="return-comparison">
        <h3>เปรียบเทียบผลตอบแทน</h3>
        <div className="comparison-info">
          <div className="comparison-item">
            <span className="comparison-label">TWR vs MWR:</span>
            <span className="comparison-value">
              {Math.abs(metrics.timeWeightedReturn - metrics.moneyWeightedReturn).toFixed(2)}% ต่างกัน
            </span>
          </div>
          <div className="comparison-explanation">
            {metrics.timeWeightedReturn > metrics.moneyWeightedReturn ? (
              <p>💡 TWR สูงกว่า MWR แสดงว่าคุณเพิ่มเงินลงทุนในช่วงที่ราคาสูง</p>
            ) : metrics.timeWeightedReturn < metrics.moneyWeightedReturn ? (
              <p>💡 MWR สูงกว่า TWR แสดงว่าคุณเพิ่มเงินลงทุนในช่วงที่ราคาต่ำ (ดี!)</p>
            ) : (
              <p>💡 TWR และ MWR ใกล้เคียงกัน แสดงว่าการกระจายเงินลงทุนสม่ำเสมอ</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

PerformanceMetrics.propTypes = {
  purchases: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      investmentAmount: PropTypes.number.isRequired,
      btcPrice: PropTypes.number.isRequired,
      btcReceived: PropTypes.number.isRequired
    })
  ).isRequired,
  currentBTCPrice: PropTypes.number.isRequired
}

export default PerformanceMetrics
