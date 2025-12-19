import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import LogTableRow from './LogTableRow'
import './LogTable.css'

/**
 * LogTable component - Displays purchase history in a table format with filtering and pagination
 * @param {Array} purchases - Array of purchase objects
 * @param {function} onDeletePurchase - Callback function to delete a purchase
 * @param {function} onUpdatePurchase - Callback function to update a purchase
 */
function LogTable({ purchases, onDeletePurchase, onUpdatePurchase }) {
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // all, 7days, 30days, 90days, year
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  // Filter and sort purchases
  const filteredPurchases = useMemo(() => {
    if (!purchases || purchases.length === 0) return []

    let filtered = [...purchases]

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()

      switch (dateFilter) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case '30days':
          cutoffDate.setDate(now.getDate() - 30)
          break
        case '90days':
          cutoffDate.setDate(now.getDate() - 90)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          break
      }

      filtered = filtered.filter(purchase => new Date(purchase.date) >= cutoffDate)
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(purchase => {
        const dateStr = new Date(purchase.date).toLocaleDateString('th-TH').toLowerCase()
        const investmentStr = purchase.investmentAmount.toString()
        const priceStr = purchase.btcPrice.toString()
        const btcStr = purchase.btcReceived.toString()

        return (
          dateStr.includes(search) ||
          investmentStr.includes(search) ||
          priceStr.includes(search) ||
          btcStr.includes(search)
        )
      })
    }

    // Sort by date (newest first) - Latest purchases appear at the top
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [purchases, dateFilter, searchTerm])

  // Pagination calculations
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPurchases = filteredPurchases.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, dateFilter, itemsPerPage])

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

  return (
    <div className="log-table-container">
      <h2>ประวัติการซื้อ</h2>

      {/* Filters and Controls */}
      <div className="table-controls">
        <div className="filter-group">
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="date-filter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="7days">7 วันล่าสุด</option>
            <option value="30days">30 วันล่าสุด</option>
            <option value="90days">90 วันล่าสุด</option>
            <option value="year">1 ปีล่าสุด</option>
          </select>

          <select
            className="items-per-page"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value="5">5 รายการ</option>
            <option value="10">10 รายการ</option>
            <option value="25">25 รายการ</option>
            <option value="50">50 รายการ</option>
            <option value="100">100 รายการ</option>
          </select>
        </div>

        <div className="results-info">
          แสดง {startIndex + 1}-{Math.min(endIndex, filteredPurchases.length)} จาก {filteredPurchases.length} รายการ
        </div>
      </div>

      {/* Table */}
      {filteredPurchases.length === 0 ? (
        <div className="log-table-empty">
          <p>ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
        </div>
      ) : (
        <>
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
                {currentPurchases.map((purchase, index) => {
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                ««
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                «
              </button>

              {/* Page numbers */}
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    )
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = array[index - 1]
                    const showEllipsis = prevPage && page - prevPage > 1

                    return (
                      <div key={page}>
                        {showEllipsis && <span className="ellipsis">...</span>}
                        <button
                          className={`page-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </div>
                    )
                  })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                »
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »»
              </button>
            </div>
          )}
        </>
      )}
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
