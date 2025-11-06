import PropTypes from 'prop-types'
import LogTableRow from './LogTableRow'
import './LogTable.css'

/**
 * LogTable component - Displays purchase history in a table format
 * @param {Array} purchases - Array of purchase objects
 * @param {function} onDeletePurchase - Callback function to delete a purchase
 * @param {function} onUpdatePurchase - Callback function to update a purchase
 */
function LogTable({ purchases, onDeletePurchase, onUpdatePurchase }) {
  // Display message when purchases array is empty
  if (!purchases || purchases.length === 0) {
    return (
      <div className="log-table-container">
        <div className="log-table-empty">
          <p>ยังไม่มีข้อมูลการซื้อ</p>
        </div>
      </div>
    )
  }

  // Sort purchases by date (newest first)
  const sortedPurchases = [...purchases].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })

  return (
    <div className="log-table-container">
      <h2>ประวัติการซื้อ</h2>
      <div className="table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>เงินลงทุน (บาท)</th>
              <th>ราคา BTC (บาท)</th>
              <th>จำนวน BTC ที่ได้รับ</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPurchases.map((purchase, index) => {
              // Find original index in unsorted array for deletion
              const originalIndex = purchases.findIndex(p => 
                p.date === purchase.date && 
                p.investmentAmount === purchase.investmentAmount &&
                p.btcPrice === purchase.btcPrice &&
                p.btcReceived === purchase.btcReceived
              )
              
              return (
                <LogTableRow
                  key={`${purchase.date}-${index}`}
                  purchase={purchase}
                  index={originalIndex}
                  onDelete={onDeletePurchase}
                  onUpdate={onUpdatePurchase}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

LogTable.propTypes = {
  purchases: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    investmentAmount: PropTypes.number.isRequired,
    btcPrice: PropTypes.number.isRequired,
    btcReceived: PropTypes.number.isRequired
  })).isRequired,
  onDeletePurchase: PropTypes.func.isRequired,
  onUpdatePurchase: PropTypes.func.isRequired
}

export default LogTable
