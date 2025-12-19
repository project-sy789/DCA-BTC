import { useState } from 'react'
import './DCACalculator.css'

/**
 * DCACalculator component - Calculate projected DCA investment outcomes
 */
function DCACalculator() {
  // Local state for form fields
  const [formData, setFormData] = useState({
    monthlyInvestment: '',
    durationMonths: '',
    averageBTCPrice: '',
    futureBTCPrice: ''
  })

  // State for validation errors
  const [errors, setErrors] = useState({})

  // State for calculation results
  const [results, setResults] = useState(null)

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  /**
   * Validate form fields
   * @returns {boolean} - True if form is valid
   */
  const validateForm = () => {
    const newErrors = {}

    // Validate monthly investment (required, positive number)
    if (!formData.monthlyInvestment) {
      newErrors.monthlyInvestment = 'กรุณากรอกจำนวนเงินลงทุนรายเดือน'
    } else if (parseFloat(formData.monthlyInvestment) <= 0) {
      newErrors.monthlyInvestment = 'จำนวนเงินต้องมากกว่า 0'
    }

    // Validate duration (required, positive integer, 1-600 months)
    if (!formData.durationMonths) {
      newErrors.durationMonths = 'กรุณากรอกระยะเวลา'
    } else {
      const duration = parseInt(formData.durationMonths)
      if (isNaN(duration) || duration <= 0) {
        newErrors.durationMonths = 'ระยะเวลาต้องมากกว่า 0'
      } else if (duration < 1 || duration > 600) {
        newErrors.durationMonths = 'ระยะเวลาต้องอยู่ระหว่าง 1-600 เดือน'
      }
    }

    // Validate average BTC price (required, positive number)
    if (!formData.averageBTCPrice) {
      newErrors.averageBTCPrice = 'กรุณากรอกราคาเฉลี่ยที่คาดว่าจะซื้อ'
    } else if (parseFloat(formData.averageBTCPrice) <= 0) {
      newErrors.averageBTCPrice = 'ราคาต้องมากกว่า 0'
    }

    // Validate future BTC price (required, positive number)
    if (!formData.futureBTCPrice) {
      newErrors.futureBTCPrice = 'กรุณากรอกราคา Bitcoin ในอนาคต'
    } else if (parseFloat(formData.futureBTCPrice) <= 0) {
      newErrors.futureBTCPrice = 'ราคาต้องมากกว่า 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Calculate DCA projections
   */
  const handleCalculate = (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    // Parse input values
    const monthlyInvestment = parseFloat(formData.monthlyInvestment)
    const durationMonths = parseInt(formData.durationMonths)
    const averageBTCPrice = parseFloat(formData.averageBTCPrice)
    const futureBTCPrice = parseFloat(formData.futureBTCPrice)

    // Calculate DCA projections
    const totalInvestment = monthlyInvestment * durationMonths
    
    // BTC accumulated based on average purchase price
    const projectedBTC = totalInvestment / averageBTCPrice
    
    // Portfolio value at future price
    const projectedValue = projectedBTC * futureBTCPrice
    
    // Profit/Loss
    const profitLoss = projectedValue - totalInvestment
    const profitLossPercent = (profitLoss / totalInvestment) * 100
    
    // Compare with lump sum investment at average price
    const lumpSumBTC = totalInvestment / averageBTCPrice
    const lumpSumValue = lumpSumBTC * futureBTCPrice
    const lumpSumProfit = lumpSumValue - totalInvestment
    
    // ROI
    const roi = profitLossPercent

    // Set results
    setResults({
      totalInvestment,
      projectedBTC,
      projectedValue,
      profitLoss,
      profitLossPercent,
      roi,
      averageBTCPrice,
      futureBTCPrice
    })
  }

  /**
   * Reset form and results
   */
  const resetForm = () => {
    setFormData({
      monthlyInvestment: '',
      durationMonths: '',
      averageBTCPrice: '',
      futureBTCPrice: ''
    })
    setErrors({})
    setResults(null)
  }

  return (
    <div className="dca-calculator">
      <h2>คำนวณการลงทุนแบบ DCA</h2>
      
      <form className="calculator-form" onSubmit={handleCalculate}>
        <div className="form-group">
          <label htmlFor="monthlyInvestment">จำนวนเงินลงทุนรายเดือน (บาท)</label>
          <input
            id="monthlyInvestment"
            type="number"
            name="monthlyInvestment"
            value={formData.monthlyInvestment}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.monthlyInvestment && (
            <span className="error-message">{errors.monthlyInvestment}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="durationMonths">ระยะเวลา (เดือน)</label>
          <input
            id="durationMonths"
            type="number"
            name="durationMonths"
            value={formData.durationMonths}
            onChange={handleChange}
            placeholder="12"
            min="1"
            max="600"
            step="1"
          />
          {errors.durationMonths && (
            <span className="error-message">{errors.durationMonths}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="averageBTCPrice">ราคาเฉลี่ยที่คาดว่าจะซื้อ (บาท)</label>
          <input
            id="averageBTCPrice"
            type="number"
            name="averageBTCPrice"
            value={formData.averageBTCPrice}
            onChange={handleChange}
            placeholder="3000000.00"
            min="0"
            step="0.01"
          />
          {errors.averageBTCPrice && (
            <span className="error-message">{errors.averageBTCPrice}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="futureBTCPrice">ราคา Bitcoin ในอนาคต (บาท)</label>
          <input
            id="futureBTCPrice"
            type="number"
            name="futureBTCPrice"
            value={formData.futureBTCPrice}
            onChange={handleChange}
            placeholder="4000000.00"
            min="0"
            step="0.01"
          />
          {errors.futureBTCPrice && (
            <span className="error-message">{errors.futureBTCPrice}</span>
          )}
        </div>

        <div className="button-group">
          <button type="submit" className="calculate-button">
            คำนวณ
          </button>
          <button type="button" className="reset-button" onClick={resetForm}>
            ล้างข้อมูล
          </button>
        </div>
      </form>

      {results && (
        <div className="results-card">
          <h3>ผลการคำนวณ DCA</h3>
          
          <div className="result-item">
            <span className="result-label">เงินลงทุนทั้งหมด:</span>
            <span className="result-value">
              ฿{results.totalInvestment.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="result-item">
            <span className="result-label">จำนวน BTC ที่คาดว่าจะได้:</span>
            <span className="result-value">
              {results.projectedBTC.toFixed(8)} BTC
            </span>
          </div>
          
          <div className="result-item">
            <span className="result-label">ราคาเฉลี่ยที่ซื้อ:</span>
            <span className="result-value">
              ฿{results.averageBTCPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="result-item">
            <span className="result-label">มูลค่าพอร์ตในอนาคต:</span>
            <span className="result-value">
              ฿{results.projectedValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="result-item highlight">
            <span className="result-label">กำไร/ขาดทุนที่คาดหวัง:</span>
            <span className={`result-value ${results.profitLoss >= 0 ? 'positive' : 'negative'}`}>
              {results.profitLoss >= 0 ? '+' : ''}฿{Math.abs(results.profitLoss).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="result-item highlight">
            <span className="result-label">ROI (ผลตอบแทน):</span>
            <span className={`result-value ${results.roi >= 0 ? 'positive' : 'negative'}`}>
              {results.roi >= 0 ? '+' : ''}{results.roi.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DCACalculator
