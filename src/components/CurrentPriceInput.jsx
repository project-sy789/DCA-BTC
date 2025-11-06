import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import BitkubService from '../services/BitkubService'
import './CurrentPriceInput.css'

/**
 * CurrentPriceInput component - Controlled input for current BTC price with auto-fetch
 * @param {number} currentPrice - Current BTC price value
 * @param {function} onPriceChange - Callback function to update price
 */
function CurrentPriceInput({ currentPrice, onPriceChange }) {
  const [inputValue, setInputValue] = useState(currentPrice || '')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  /**
   * Auto-refresh price every 30 seconds
   */
  useEffect(() => {
    if (!autoRefresh) return

    /**
     * Fetch BTC price from Bitkub
     */
    const fetchPrice = async () => {
      setIsLoading(true)
      try {
        const price = await BitkubService.fetchBTCPrice()
        setInputValue(price)
        onPriceChange(price)
        setLastUpdate(new Date())
      } catch (error) {
        console.error('Failed to fetch BTC price:', error)
        // Don't show alert on auto-refresh to avoid annoying users
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch immediately on mount
    fetchPrice()

    // Set up interval for auto-refresh
    const interval = setInterval(() => {
      fetchPrice()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, onPriceChange])

  /**
   * Manual refresh handler
   */
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const price = await BitkubService.fetchBTCPrice()
      setInputValue(price)
      onPriceChange(price)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch BTC price:', error)
      alert('ไม่สามารถดึงราคาจาก Bitkub ได้ กรุณาลองอีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle manual input change with validation
   * Only allows positive numbers
   */
  const handleChange = (e) => {
    const value = e.target.value
    
    // Disable auto-refresh when user manually edits
    setAutoRefresh(false)
    
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

  /**
   * Format last update time
   */
  const formatLastUpdate = () => {
    if (!lastUpdate) return ''
    return lastUpdate.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="current-price-input">
      <div className="price-header">
        <label htmlFor="current-btc-price">
          ราคา Bitcoin ปัจจุบัน (บาท)
        </label>
        <div className="price-actions">
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            title="รีเฟรชราคา"
          >
            {isLoading ? '⏳' : '🔄'}
          </button>
          <button
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'ปิดอัพเดทอัตโนมัติ' : 'เปิดอัพเดทอัตโนมัติ'}
          >
            {autoRefresh ? '🟢' : '⚪'}
          </button>
        </div>
      </div>
      <div className="price-input-wrapper">
        <input
          id="current-btc-price"
          type="number"
          value={inputValue}
          onChange={handleChange}
          placeholder="กรอกราคา Bitcoin ปัจจุบัน"
          min="0"
          step="0.01"
          disabled={isLoading}
        />
        {lastUpdate && (
          <div className="last-update">
            อัพเดทล่าสุด: {formatLastUpdate()}
            {autoRefresh && <span className="auto-badge">Auto</span>}
          </div>
        )}
      </div>
      <div className="price-info">
        <small>
          💡 ราคาดึงจาก Bitkub อัตโนมัติทุก 30 วินาที
        </small>
      </div>
    </div>
  )
}

CurrentPriceInput.propTypes = {
  currentPrice: PropTypes.number.isRequired,
  onPriceChange: PropTypes.func.isRequired
}

export default CurrentPriceInput
