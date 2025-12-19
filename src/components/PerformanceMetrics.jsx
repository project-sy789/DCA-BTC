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

    // Calculate total investment and current value
    const totalInvestment = sortedPurchases.reduce((sum, p) => sum + p.investmentAmount, 0)
    const totalBTC = sortedPurchases.reduce((sum, p) => sum + p.btcReceived, 0)
    const currentPortfolioValue = totalBTC * currentBTCPrice

    // Build portfolio history with cumulative values
    const portfolioHistory = []
    let cumulativeBTC = 0
    let cumulativeInvestment = 0

    sortedPurchases.forEach(purchase => {
      cumulativeBTC += purchase.btcReceived
      cumulativeInvestment += purchase.investmentAmount

      // Portfolio value at this date = total BTC × BTC price at this date
      portfolioHistory.push({
        date: new Date(purchase.date),
        portfolioValue: cumulativeBTC * purchase.btcPrice,
        investment: cumulativeInvestment,
        btcPrice: purchase.btcPrice,
        cumulativeBTC
      })
    })

    // Add current state
    portfolioHistory.push({
      date: new Date(),
      portfolioValue: currentPortfolioValue,
      investment: cumulativeInvestment,
      btcPrice: currentBTCPrice,
      cumulativeBTC
    })

    // 1. Calculate Maximum Drawdown (from portfolio return percentage)
    // Drawdown measures the peak-to-trough decline in portfolio return %
    let maxDrawdown = 0
    let peakReturnPct = -Infinity

    portfolioHistory.forEach(point => {
      // Calculate return percentage at this point
      const returnPct = point.investment > 0
        ? ((point.portfolioValue - point.investment) / point.investment) * 100
        : 0

      // Track peak return
      if (returnPct > peakReturnPct) {
        peakReturnPct = returnPct
      }

      // Calculate drawdown from peak
      const drawdown = peakReturnPct - returnPct
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    // 2. Calculate Sharpe Ratio (using daily returns approach)
    let sharpeRatio = 0

    if (portfolioHistory.length >= 2) {
      // Calculate period returns
      const returns = []

      for (let i = 1; i < portfolioHistory.length; i++) {
        const prevValue = portfolioHistory[i - 1].portfolioValue
        const prevInvestment = portfolioHistory[i - 1].investment
        const currValue = portfolioHistory[i].portfolioValue
        const currInvestment = portfolioHistory[i].investment

        // Calculate return accounting for new cash flows
        if (prevValue > 0) {
          const cashFlow = currInvestment - prevInvestment
          const adjustedPrevValue = prevValue + cashFlow

          if (adjustedPrevValue > 0) {
            const periodReturn = ((currValue - adjustedPrevValue) / adjustedPrevValue) * 100
            returns.push(periodReturn)
          }
        }
      }

      if (returns.length > 1) {
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        const stdDev = Math.sqrt(variance)

        if (stdDev > 0) {
          sharpeRatio = avgReturn / stdDev
        }
      }
    }

    // 3. Calculate Time-Weighted Return (TWR)
    // TWR measures the compound rate of growth based on BTC price changes
    // It eliminates the effect of cash flows timing
    let timeWeightedReturn = 0
    let twrLabel = 'ผลตอบแทนรวม'

    if (sortedPurchases.length > 0) {
      const firstDate = new Date(sortedPurchases[0].date)
      const lastDate = new Date()
      const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24)

      // Calculate TWR based on BTC price change (not portfolio value)
      const firstBTCPrice = sortedPurchases[0].btcPrice

      if (firstBTCPrice > 0 && daysDiff > 0) {
        const priceReturn = (currentBTCPrice - firstBTCPrice) / firstBTCPrice
        const totalReturn = priceReturn * 100

        // Only annualize if:
        // 1. Holding period >= 90 days (more reliable annualization)
        // 2. Return is not too negative (avoid extreme annualized losses)
        if (daysDiff >= 90 && priceReturn > -0.5) {
          const annualizedReturn = (Math.pow(1 + priceReturn, 365 / daysDiff) - 1) * 100

          if (isFinite(annualizedReturn) && Math.abs(annualizedReturn) <= 100) {
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

    // 4. Calculate Money-Weighted Return (MWR) using IRR approximation
    // MWR = IRR that considers timing and size of cash flows
    let moneyWeightedReturn = 0
    let mwrLabel = 'ผลตอบแทนต่อปี'

    if (totalInvestment > 0 && sortedPurchases.length > 0) {
      const now = new Date()

      // Simple IRR approximation using Newton-Raphson method
      const calculateNPV = (rate) => {
        let npv = 0

        sortedPurchases.forEach(purchase => {
          const daysSince = (now - new Date(purchase.date)) / (1000 * 60 * 60 * 24)
          const yearsSince = daysSince / 365
          npv -= purchase.investmentAmount / Math.pow(1 + rate, yearsSince)
        })

        npv += currentPortfolioValue
        return npv
      }

      // Newton-Raphson iteration to find IRR
      let irr = 0.1 // Initial guess: 10%
      const maxIterations = 100
      const tolerance = 0.0001

      for (let i = 0; i < maxIterations; i++) {
        const npv = calculateNPV(irr)

        if (Math.abs(npv) < tolerance) {
          break
        }

        // Calculate derivative (slope)
        const delta = 0.0001
        const npvPlus = calculateNPV(irr + delta)
        const derivative = (npvPlus - npv) / delta

        if (Math.abs(derivative) < tolerance) {
          break
        }

        // Update IRR
        irr = irr - npv / derivative

        // Prevent extreme values
        if (irr < -0.99) irr = -0.99
        if (irr > 10) irr = 10
      }

      // Calculate average holding period for labeling
      let weightedDays = 0
      sortedPurchases.forEach(purchase => {
        const daysSince = (now - new Date(purchase.date)) / (1000 * 60 * 60 * 24)
        weightedDays += (purchase.investmentAmount / totalInvestment) * daysSince
      })

      // Determine if we should show annualized or total return
      if (weightedDays >= 30 && isFinite(irr) && Math.abs(irr * 100) <= 1000) {
        moneyWeightedReturn = irr * 100
        mwrLabel = 'ผลตอบแทนต่อปี (Annualized IRR)'
      } else {
        // Fallback to simple return
        const simpleReturn = ((currentPortfolioValue - totalInvestment) / totalInvestment) * 100
        moneyWeightedReturn = simpleReturn
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
      totalInvestment,
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
