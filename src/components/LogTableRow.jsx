import { useState } from 'react'
import PropTypes from 'prop-types'
import './LogTableRow.css'

/**
 * LogTableRow component - Displays a single purchase record in table row format
 * @param {Object} purchase - Purchase object with date, investmentAmount, btcPrice, btcReceived
 * @param {number} index - Index of the purchase in the array
 * @param {function} onDelete - Callback function to delete the purchase
 * @param {function} onUpdate - Callback function to update the purchase
 */
function LogTableRow({ purchase, index, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    date: purchase.date,
    investmentAmount: purchase.investmentAmount,
    btcPrice: purchase.btcPrice,
    btcReceived: purchase.btcReceived
  })
  /**
   * Format number with thousand separators and decimal places
   * @param {number} value - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted number
   */
  const formatNumber = (value, decimals = 2) => {
    return value.toLocaleString('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  /**
   * Format date to Thai format
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {string} - Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDelete = () => {
    onDelete(index)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    const updatedPurchase = {
      date: editedData.date,
      investmentAmount: editedData.investmentAmount,
      btcPrice: editedData.btcPrice,
      btcReceived: editedData.btcReceived
    }
    onUpdate(index, updatedPurchase)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedData({
      date: purchase.date,
      investmentAmount: purchase.investmentAmount,
      btcPrice: purchase.btcPrice,
      btcReceived: purchase.btcReceived
    })
    setIsEditing(false)
  }

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: field === 'date' ? value : parseFloat(value) || 0
    }))
  }

  if (isEditing) {
    return (
      <tr className="log-table-row editing">
        <td className="date-cell">
          <input
            type="date"
            value={editedData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="edit-input"
          />
        </td>
        <td className="amount-cell">
          <input
            type="number"
            value={editedData.investmentAmount}
            onChange={(e) => handleInputChange('investmentAmount', e.target.value)}
            className="edit-input"
            step="0.01"
          />
        </td>
        <td className="price-cell">
          <input
            type="number"
            value={editedData.btcPrice}
            onChange={(e) => handleInputChange('btcPrice', e.target.value)}
            className="edit-input"
            step="0.01"
          />
        </td>
        <td className="btc-cell">
          <input
            type="number"
            value={editedData.btcReceived}
            onChange={(e) => handleInputChange('btcReceived', e.target.value)}
            className="edit-input"
            step="0.00000001"
          />
        </td>
        <td className="actions-cell">
          <button 
            className="save-button" 
            onClick={handleSave}
            aria-label="บันทึก"
            title="บันทึก"
          >
            ✓
          </button>
          <button 
            className="cancel-button" 
            onClick={handleCancel}
            aria-label="ยกเลิก"
            title="ยกเลิก"
          >
            ✕
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="log-table-row">
      <td className="date-cell">{formatDate(purchase.date)}</td>
      <td className="amount-cell">{formatNumber(purchase.investmentAmount, 2)}</td>
      <td className="price-cell">{formatNumber(purchase.btcPrice, 2)}</td>
      <td className="btc-cell">{formatNumber(purchase.btcReceived, 8)}</td>
      <td className="actions-cell">
        <button 
          className="edit-button" 
          onClick={handleEdit}
          aria-label="แก้ไขข้อมูล"
          title="แก้ไข"
        >
          ✏️
        </button>
        <button 
          className="delete-button" 
          onClick={handleDelete}
          aria-label="ลบข้อมูล"
          title="ลบ"
        >
          🗑️
        </button>
      </td>
    </tr>
  )
}

LogTableRow.propTypes = {
  purchase: PropTypes.shape({
    date: PropTypes.string.isRequired,
    investmentAmount: PropTypes.number.isRequired,
    btcPrice: PropTypes.number.isRequired,
    btcReceived: PropTypes.number.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export default LogTableRow
