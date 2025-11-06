import { useState } from 'react'
import PropTypes from 'prop-types'
import './CurrentPriceInput.css'

/**
 * CurrentPriceInput component - Controlled input for current BTC price
 * @param {number} currentPrice - Current BTC price value
 * @param {function} onPriceChange - Callback function to update price
 */
function CurrentPriceInput({ currentPrice, onPriceChange }) {
  const [inputValue, setInputValue] = useState(currentPrice || '')

  /**
   * Handle input change with validation
   * Only allows positive numbers
   */
  const handleChange = (e) => {
    const value = e.target.value
    
    // Allow empty string for clearing
    if (value === '') {
      setInputValue('')
      onPriceChange(0)
      return
    }

    // Validate positive numbers only
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setInputValue(value)
      onPriceChange(numValue)
    }
  }

  return (
    <div className="current-price-input">
      <label htmlFor="current-btc-price">
        ราคา Bitcoin ปัจจุบัน (บาท)
      </label>
      <input
        id="current-btc-price"
        type="number"
        value={inputValue}
        onChange={handleChange}
        placeholder="กรอกราคา Bitcoin ปัจจุบัน"
        min="0"
        step="0.01"
      />
    </div>
  )
}

CurrentPriceInput.propTypes = {
  currentPrice: PropTypes.number.isRequired,
  onPriceChange: PropTypes.func.isRequired
}

export default CurrentPriceInput
