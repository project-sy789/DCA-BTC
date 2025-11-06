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
    expectedBTCPrice: ''
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

    // Validate expected BTC price (required, positive number)
    if (!formData.expectedBTCPrice) {
      newErrors.expectedBTCPrice = 'กรุณากรอกราคา Bitcoin ที่คาดหวัง'
    } else if (parseFloat(formData.expectedBTCPrice) <= 0) {
      newErrors.expectedBTCPrice = 'ราคาต้องมากกว่า 0'
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
    const expectedBTCPrice = parseFloat(formData.expectedBTCPrice)

    // Calculate projections
    const totalInvestment = monthlyInvestment * durationMonths
    const projectedBTC = totalInvestment / expectedBTCPrice
    const projectedValue = projectedBTC * expectedBTCPrice

    // Set results
    setResults({
      totalInvestment,
      projectedBTC,
      projectedValue
    })
  }

  /**
   * Reset form and results
   */
  const resetForm = () => {
    setFormData({
      monthlyInvestment: '',
      durationMonths: '',
      expectedBTCPrice: ''
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
          <label htmlFor="expectedBTCPrice">ราคา Bitcoin ที่คาดหวังเฉลี่ย (บาท)</label>
          <input
            id="expectedBTCPrice"
            type="number"
            name="expectedBTCPrice"
            value={formData.expectedBTCPrice}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.expectedBTCPrice && (
            <span className="error-message">{errors.expectedBTCPrice}</span>
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
          <h3>ผลการคำนวณ</h3>
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
            <span className="result-label">มูลค่าพอร์ตที่คาดหวัง:</span>
            <span className="result-value">
              ฿{results.projectedValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DCACalculator
