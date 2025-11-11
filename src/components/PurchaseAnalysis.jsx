import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import './PurchaseAnalysis.css'

/**
 * PurchaseAnalysis component - Shows unrealized gain/loss for each purchase with pagination
 * @param {Array} purchases - Array of purchase objects
 * @param {number} currentBTCPrice - Current Bitcoin price
 */
function PurchaseAnalysis({ purchases, currentBTCPrice }) {
  // Pagination state - simple, no useEffect needed
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const analysisData = useMemo(() => {
    if (!purchases || purchases.length === 0) {
      return null
    }

    // Calculate gain/loss for each purchase
    const purchaseDetails = purchases.map((purchase, index) => {
      const currentValue = purchase.btcReceived * currentBTCPrice
      const unrealizedGainLoss = currentValue - purchase.investmentAmount
      const unrealizedGainLossPercent = (unrealizedGainLoss / purchase.investmentAmount) * 100
      const priceChange = currentBTCPrice - purchase.btcPrice
      const priceChangePercent = (priceChange / purchase.btcPrice) * 100

      return {
        index: index + 1,
        date: purchase.date,
        investmentAmount: purchase.investmentAmount,
        btcPrice: purchase.btcPrice,
        btcReceived: purchase.btcReceived,
        currentValue,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        priceChange,
        priceChangePercent
      }
    })

    // Sort by unrealized gain/loss (best to worst)
    const sortedByPerformance = [...purchaseDetails].sort((a, b) => 
      b.unrealizedGainLossPercent - a.unrealizedGainLossPercent
    )

    // Calculate summary statistics
    const totalInvestment = purchaseDetails.reduce((sum, p) => sum + p.investmentAmount, 0)
    const totalCurrentValue = purchaseDetails.reduce((sum, p) => sum + p.currentValue, 0)
    const totalUnrealizedGainLoss = totalCurrentValue - totalInvestment
    const profitablePurchases = purchaseDetails.filter(p => p.unrealizedGainLoss > 0).length
    const losingPurchases = purchaseDetails.filter(p => p.unrealizedGainLoss < 0).length
    const bestPurchase = sortedByPerformance[0]
    const worstPurchase = sortedByPerformance[sortedByPerformance.length - 1]

    return {
      purchaseDetails,
      sortedByPerformance,
      summary: {
        totalInvestment,
        totalCurrentValue,
        totalUnrealizedGainLoss,
        profitablePurchases,
        losingPurchases,
        bestPurchase,
        worstPurchase
      }
    }
  }, [purchases, currentBTCPrice])

  if (!analysisData) {
    return (
      <div className="purchase-analysis">
        <h2>วิเคราะห์กำไร/ขาดทุนแต่ละครั้งซื้อ</h2>
        <div className="no-data-message">
          <p>ยังไม่มีข้อมูลการซื้อ</p>
        </div>
      </div>
    )
  }

  const { purchaseDetails, summary } = analysisData

  // Pagination calculations - no useEffect, just direct calculation
  const totalPages = Math.ceil(purchaseDetails.length / itemsPerPage)
  
  // Auto-adjust currentPage if it exceeds totalPages
  const safePage = Math.min(currentPage, Math.max(1, totalPages))
  const startIndex = (safePage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPurchases = purchaseDetails.slice(startIndex, endIndex)

  // Handler for changing items per page - resets to page 1
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to page 1 in the same handler
  }

  return (
    <div className="purchase-analysis">
      <h2>วิเคราะห์กำไร/ขาดทุนแต่ละครั้งซื้อ</h2>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-label">การซื้อที่กำไร</div>
          <div className="summary-value positive">
            {summary.profitablePurchases} ครั้ง
          </div>
          <div className="summary-detail">
            จาก {purchaseDetails.length} ครั้งทั้งหมด
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">การซื้อที่ขาดทุน</div>
          <div className="summary-value negative">
            {summary.losingPurchases} ครั้ง
          </div>
          <div className="summary-detail">
            จาก {purchaseDetails.length} ครั้งทั้งหมด
          </div>
        </div>

        <div className="summary-card highlight">
          <div className="summary-label">การซื้อที่ดีที่สุด</div>
          <div className={`summary-value ${summary.bestPurchase.unrealizedGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {summary.bestPurchase.unrealizedGainLoss >= 0 ? '+' : ''}
            {summary.bestPurchase.unrealizedGainLossPercent.toFixed(2)}%
          </div>
          <div className="summary-detail">
            {new Date(summary.bestPurchase.date).toLocaleDateString('th-TH')}
          </div>
        </div>

        <div className="summary-card highlight">
          <div className="summary-label">การซื้อที่แย่ที่สุด</div>
          <div className={`summary-value ${summary.worstPurchase.unrealizedGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {summary.worstPurchase.unrealizedGainLoss >= 0 ? '+' : ''}
            {summary.worstPurchase.unrealizedGainLossPercent.toFixed(2)}%
          </div>
          <div className="summary-detail">
            {new Date(summary.worstPurchase.date).toLocaleDateString('th-TH')}
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="table-controls">
        <div className="filter-group">
          <select
            className="items-per-page"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          >
            <option value="10">10 รายการ</option>
            <option value="25">25 รายการ</option>
            <option value="50">50 รายการ</option>
            <option value="100">100 รายการ</option>
            <option value={purchaseDetails.length}>ทั้งหมด ({purchaseDetails.length})</option>
          </select>
        </div>

        <div className="results-info">
          แสดง {startIndex + 1}-{Math.min(endIndex, purchaseDetails.length)} จาก {purchaseDetails.length} รายการ
        </div>
      </div>

      {/* Purchase Details Table */}
      <div className="purchase-table-container">
        <table className="purchase-table">
          <thead>
            <tr>
              <th>#</th>
              <th>วันที่</th>
              <th>เงินลงทุน</th>
              <th>ราคาซื้อ</th>
              <th>BTC ที่ได้</th>
              <th>มูลค่าปัจจุบัน</th>
              <th>กำไร/ขาดทุน</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {currentPurchases.map((purchase) => (
              <tr key={purchase.index} className={purchase.unrealizedGainLoss >= 0 ? 'profit-row' : 'loss-row'}>
                <td>{purchase.index}</td>
                <td>{new Date(purchase.date).toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}</td>
                <td>฿{purchase.investmentAmount.toLocaleString('th-TH', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}</td>
                <td>฿{purchase.btcPrice.toLocaleString('th-TH', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}</td>
                <td>{purchase.btcReceived.toFixed(8)}</td>
                <td>฿{purchase.currentValue.toLocaleString('th-TH', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}</td>
                <td className={purchase.unrealizedGainLoss >= 0 ? 'positive' : 'negative'}>
                  {purchase.unrealizedGainLoss >= 0 ? '+' : ''}
                  ฿{Math.abs(purchase.unrealizedGainLoss).toLocaleString('th-TH', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className={purchase.unrealizedGainLossPercent >= 0 ? 'positive' : 'negative'}>
                  {purchase.unrealizedGainLossPercent >= 0 ? '+' : ''}
                  {purchase.unrealizedGainLossPercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan="2"><strong>รวม</strong></td>
              <td><strong>฿{summary.totalInvestment.toLocaleString('th-TH', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}</strong></td>
              <td colSpan="2"></td>
              <td><strong>฿{summary.totalCurrentValue.toLocaleString('th-TH', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}</strong></td>
              <td className={summary.totalUnrealizedGainLoss >= 0 ? 'positive' : 'negative'}>
                <strong>
                  {summary.totalUnrealizedGainLoss >= 0 ? '+฿' : '-฿'}
                  {Math.abs(summary.totalUnrealizedGainLoss).toLocaleString('th-TH', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </strong>
              </td>
              <td className={summary.totalUnrealizedGainLoss >= 0 ? 'positive' : 'negative'}>
                <strong>
                  {summary.totalUnrealizedGainLoss >= 0 ? '+' : ''}
                  {((summary.totalUnrealizedGainLoss / summary.totalInvestment) * 100).toFixed(2)}%
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

PurchaseAnalysis.propTypes = {
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

export default PurchaseAnalysis
