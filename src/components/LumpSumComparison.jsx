import { useMemo } from 'react'
import './LumpSumComparison.css'

function LumpSumComparison({ purchases, currentBTCPrice }) {
  // Calculate comparison data using useMemo for performance
  const comparisonData = useMemo(() => {
    // Handle edge case: insufficient data
    if (!purchases || purchases.length < 2) {
      return null
    }

    // Sort purchases by date to find earliest purchase
    const sortedPurchases = [...purchases].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    )

    const earliestPurchase = sortedPurchases[0]
    const earliestBTCPrice = earliestPurchase.btcPrice

    // Calculate DCA strategy totals
    const dcaTotalInvestment = purchases.reduce(
      (sum, purchase) => sum + purchase.investmentAmount, 
      0
    )
    const dcaTotalBTC = purchases.reduce(
      (sum, purchase) => sum + purchase.btcReceived, 
      0
    )
    const dcaCurrentValue = dcaTotalBTC * currentBTCPrice
    const dcaReturnPercent = dcaTotalInvestment > 0 
      ? ((dcaCurrentValue - dcaTotalInvestment) / dcaTotalInvestment) * 100 
      : 0

    // Calculate hypothetical lump sum investment
    const lumpSumTotalInvestment = dcaTotalInvestment
    const lumpSumTotalBTC = lumpSumTotalInvestment / earliestBTCPrice
    const lumpSumCurrentValue = lumpSumTotalBTC * currentBTCPrice
    const lumpSumReturnPercent = lumpSumTotalInvestment > 0
      ? ((lumpSumCurrentValue - lumpSumTotalInvestment) / lumpSumTotalInvestment) * 100
      : 0

    // Calculate differences
    const btcDifference = lumpSumTotalBTC - dcaTotalBTC
    const valueDifference = lumpSumCurrentValue - dcaCurrentValue
    const returnDifference = lumpSumReturnPercent - dcaReturnPercent
    const betterStrategy = lumpSumCurrentValue > dcaCurrentValue ? 'lumpsum' : 'dca'

    return {
      dcaStrategy: {
        totalInvestment: dcaTotalInvestment,
        totalBTC: dcaTotalBTC,
        currentValue: dcaCurrentValue,
        returnPercent: dcaReturnPercent
      },
      lumpSumStrategy: {
        totalInvestment: lumpSumTotalInvestment,
        totalBTC: lumpSumTotalBTC,
        currentValue: lumpSumCurrentValue,
        returnPercent: lumpSumReturnPercent
      },
      difference: {
        btcDifference,
        valueDifference,
        returnDifference,
        betterStrategy
      },
      earliestDate: earliestPurchase.date,
      earliestPrice: earliestBTCPrice
    }
  }, [purchases, currentBTCPrice])

  // Handle insufficient data case
  if (!comparisonData) {
    return (
      <div className="lump-sum-comparison">
        <h2>เปรียบเทียบกับการลงทุนแบบก้อนเดียว</h2>
        <div className="insufficient-data-message">
          <p>ต้องมีข้อมูลการซื้ออย่างน้อย 2 ครั้งเพื่อทำการเปรียบเทียบ</p>
        </div>
      </div>
    )
  }

  const { dcaStrategy, lumpSumStrategy, difference, earliestDate, earliestPrice } = comparisonData

  return (
    <div className="lump-sum-comparison">
      <h2>เปรียบเทียบกับการลงทุนแบบก้อนเดียว</h2>
      <p className="comparison-description">
        เปรียบเทียบผลตอบแทนระหว่างการลงทุนแบบ DCA กับการลงทุนแบบก้อนเดียวในวันที่ {new Date(earliestDate).toLocaleDateString('th-TH')} 
        ที่ราคา ฿{earliestPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      
      <div className="comparison-container">
        {/* DCA Strategy Column */}
        <div className={`strategy-card ${difference.betterStrategy === 'dca' ? 'better-strategy' : 'worse-strategy'}`}>
          <h3>กลยุทธ์ DCA</h3>
          <div className="strategy-metrics">
            <div className="metric">
              <span className="metric-label">เงินลงทุนทั้งหมด:</span>
              <span className="metric-value">
                ฿{dcaStrategy.totalInvestment.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">BTC ที่ได้รับ:</span>
              <span className="metric-value">
                {dcaStrategy.totalBTC.toFixed(8)} BTC
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">มูลค่าปัจจุบัน:</span>
              <span className="metric-value">
                ฿{dcaStrategy.currentValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">ผลตอบแทน:</span>
              <span className={`metric-value ${dcaStrategy.returnPercent >= 0 ? 'positive' : 'negative'}`}>
                {dcaStrategy.returnPercent >= 0 ? '+' : ''}{dcaStrategy.returnPercent.toFixed(2)}%
              </span>
            </div>
          </div>
          {difference.betterStrategy === 'dca' && (
            <div className="strategy-badge better">กลยุทธ์ที่ดีกว่า</div>
          )}
        </div>

        {/* Lump Sum Strategy Column */}
        <div className={`strategy-card ${difference.betterStrategy === 'lumpsum' ? 'better-strategy' : 'worse-strategy'}`}>
          <h3>กลยุทธ์ลงทุนก้อนเดียว</h3>
          <div className="strategy-metrics">
            <div className="metric">
              <span className="metric-label">เงินลงทุนทั้งหมด:</span>
              <span className="metric-value">
                ฿{lumpSumStrategy.totalInvestment.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">BTC ที่ได้รับ:</span>
              <span className="metric-value">
                {lumpSumStrategy.totalBTC.toFixed(8)} BTC
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">มูลค่าปัจจุบัน:</span>
              <span className="metric-value">
                ฿{lumpSumStrategy.currentValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">ผลตอบแทน:</span>
              <span className={`metric-value ${lumpSumStrategy.returnPercent >= 0 ? 'positive' : 'negative'}`}>
                {lumpSumStrategy.returnPercent >= 0 ? '+' : ''}{lumpSumStrategy.returnPercent.toFixed(2)}%
              </span>
            </div>
          </div>
          {difference.betterStrategy === 'lumpsum' && (
            <div className="strategy-badge better">กลยุทธ์ที่ดีกว่า</div>
          )}
        </div>
      </div>

      {/* Difference Metrics */}
      <div className="difference-section">
        <h3>ความแตกต่าง</h3>
        <div className="difference-metrics">
          <div className="difference-metric">
            <span className="difference-label">ส่วนต่าง BTC:</span>
            <span className={`difference-value ${difference.btcDifference >= 0 ? 'positive' : 'negative'}`}>
              {difference.btcDifference >= 0 ? '+' : ''}{difference.btcDifference.toFixed(8)} BTC
            </span>
          </div>
          <div className="difference-metric">
            <span className="difference-label">ส่วนต่างมูลค่า:</span>
            <span className={`difference-value ${difference.valueDifference >= 0 ? 'positive' : 'negative'}`}>
              {difference.valueDifference >= 0 ? '+' : ''}฿{Math.abs(difference.valueDifference).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="difference-metric">
            <span className="difference-label">ส่วนต่างผลตอบแทน:</span>
            <span className={`difference-value ${difference.returnDifference >= 0 ? 'positive' : 'negative'}`}>
              {difference.returnDifference >= 0 ? '+' : ''}{difference.returnDifference.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LumpSumComparison
