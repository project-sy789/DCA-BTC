import { useState } from 'react'
import PropTypes from 'prop-types'
import { parseBitkubLineMessage, isBitkubLineMessage } from '../utils/bitkubParser'
import './PurchaseForm.css'

/**
 * PurchaseForm component - Form for adding new Bitcoin purchase records
 * @param {function} onAddPurchase - Callback function to add purchase
 */
function PurchaseForm({ onAddPurchase }) {
  // Local state for form fields
  const [formData, setFormData] = useState({
    date: '',
    investmentAmount: '',
    btcPrice: '',
    btcReceived: ''
  })

  // State for validation errors
  const [errors, setErrors] = useState({})

  // State to track if user manually entered BTC amount
  const [manualBTC, setManualBTC] = useState(false)

  // State for Bitkub LINE import
  const [pasteText, setPasteText] = useState('')
  const [showPasteSection, setShowPasteSection] = useState(false)
  const [pasteMessage, setPasteMessage] = useState({ type: '', text: '' })

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target

    // If user manually changes BTC amount, mark it as manual
    if (name === 'btcReceived') {
      setManualBTC(true)
    }

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

    // Validate date (required)
    if (!formData.date) {
      newErrors.date = 'กรุณาเลือกวันที่'
    }

    // Validate investment amount (required, positive number)
    if (!formData.investmentAmount) {
      newErrors.investmentAmount = 'กรุณากรอกจำนวนเงินลงทุน'
    } else if (parseFloat(formData.investmentAmount) <= 0) {
      newErrors.investmentAmount = 'จำนวนเงินต้องมากกว่า 0'
    }

    // Validate BTC price (required, positive number)
    if (!formData.btcPrice) {
      newErrors.btcPrice = 'กรุณากรอกราคา Bitcoin'
    } else if (parseFloat(formData.btcPrice) <= 0) {
      newErrors.btcPrice = 'ราคาต้องมากกว่า 0'
    }

    // Validate BTC received (required, positive number)
    if (!formData.btcReceived) {
      newErrors.btcReceived = 'กรุณากรอกจำนวน BTC ที่ได้รับ'
    } else if (parseFloat(formData.btcReceived) <= 0) {
      newErrors.btcReceived = 'จำนวน BTC ต้องมากกว่า 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Calculate BTC received (for auto-fill suggestion)
   * @returns {number} - Amount of BTC received
   */
  const calculateBTCReceived = () => {
    const investment = parseFloat(formData.investmentAmount)
    const price = parseFloat(formData.btcPrice)

    if (isNaN(investment) || isNaN(price) || price === 0) {
      return 0
    }

    return investment / price
  }

  /**
   * Auto-fill BTC amount if not manually entered
   */
  const autoFillBTC = () => {
    if (!manualBTC && formData.investmentAmount && formData.btcPrice) {
      const calculated = calculateBTCReceived()
      if (calculated > 0 && !formData.btcReceived) {
        setFormData(prev => ({
          ...prev,
          btcReceived: calculated.toFixed(8)
        }))
      }
    }
  }

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    // Create purchase object
    const purchase = {
      date: formData.date,
      investmentAmount: parseFloat(formData.investmentAmount),
      btcPrice: parseFloat(formData.btcPrice),
      btcReceived: parseFloat(formData.btcReceived)
    }

    // Pass to parent
    onAddPurchase(purchase)

    // Show success message
    alert('เพิ่มข้อมูลการซื้อสำเร็จ!')

    // Reset form
    setFormData({
      date: '',
      investmentAmount: '',
      btcPrice: '',
      btcReceived: ''
    })
    setErrors({})
    setManualBTC(false)
  }

  /**
   * Handle paste import from Bitkub LINE
   */
  const handlePasteImport = () => {
    // Clear previous messages
    setPasteMessage({ type: '', text: '' })

    // Check if text is provided
    if (!pasteText.trim()) {
      setPasteMessage({ type: 'error', text: 'กรุณาวางข้อความจาก Bitkub LINE' })
      return
    }

    // Check if text looks like Bitkub message
    if (!isBitkubLineMessage(pasteText)) {
      setPasteMessage({
        type: 'error',
        text: 'รูปแบบข้อความไม่ถูกต้อง กรุณาตรวจสอบว่าคัดลอกข้อความจาก Bitkub LINE ครบถ้วน'
      })
      return
    }

    // Parse the message
    const parsed = parseBitkubLineMessage(pasteText)

    if (!parsed) {
      setPasteMessage({
        type: 'error',
        text: 'ไม่สามารถแปลงข้อมูลได้ กรุณาตรวจสอบรูปแบบข้อความ'
      })
      return
    }

    // Fill form with parsed data
    setFormData({
      date: parsed.date,
      investmentAmount: parsed.investmentAmount.toString(),
      btcPrice: parsed.btcPrice.toString(),
      btcReceived: parsed.btcReceived.toString()
    })

    // Mark as manual BTC entry to prevent auto-calculation override
    setManualBTC(true)

    // Show success message
    setPasteMessage({
      type: 'success',
      text: '✅ นำเข้าข้อมูลสำเร็จ! กรุณาตรวจสอบข้อมูลก่อนบันทึก'
    })

    // Clear paste text
    setPasteText('')

    // Optionally hide paste section after successful import
    setTimeout(() => {
      setShowPasteSection(false)
    }, 2000)
  }

  // Calculate suggested BTC amount
  const suggestedBTC = calculateBTCReceived()

  return (
    <form className="purchase-form" onSubmit={handleSubmit}>
      <h3>เพิ่มข้อมูลการซื้อ</h3>

      {/* Quick Import Section */}
      <div className="quick-import-section">
        <button
          type="button"
          className="toggle-paste-button"
          onClick={() => setShowPasteSection(!showPasteSection)}
        >
          {showPasteSection ? '📝 ซ่อนการนำเข้าด่วน' : '⚡ นำเข้าด่วนจาก Bitkub LINE'}
        </button>

        {showPasteSection && (
          <div className="paste-import-container">
            <label htmlFor="pasteText">วางข้อความจาก Bitkub LINE</label>
            <textarea
              id="pasteText"
              className="paste-textarea"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`ตัวอย่าง:
🤗🎉 You Spent : 108 THB
Price : 2716645.94 THB/BTC
You Received : 0.00003975 BTC
Time : 2025-12-18 07:46:51`}
              rows={6}
            />
            <button
              type="button"
              className="parse-button"
              onClick={handlePasteImport}
            >
              🚀 นำเข้าข้อมูล
            </button>
            {pasteMessage.text && (
              <div className={`paste-message paste-message-${pasteMessage.type}`}>
                {pasteMessage.text}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="date">วันที่</label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
        {errors.date && <span className="error-message">{errors.date}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="investmentAmount">จำนวนเงินลงทุน (บาท)</label>
        <input
          id="investmentAmount"
          type="number"
          name="investmentAmount"
          value={formData.investmentAmount}
          onChange={handleChange}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        {errors.investmentAmount && (
          <span className="error-message">{errors.investmentAmount}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="btcPrice">ราคา Bitcoin (บาท)</label>
        <input
          id="btcPrice"
          type="number"
          name="btcPrice"
          value={formData.btcPrice}
          onChange={handleChange}
          onBlur={autoFillBTC}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        {errors.btcPrice && (
          <span className="error-message">{errors.btcPrice}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="btcReceived">
          จำนวน BTC ที่ได้รับจริง
          {suggestedBTC > 0 && !formData.btcReceived && (
            <span className="suggestion"> (แนะนำ: {suggestedBTC.toFixed(8)})</span>
          )}
        </label>
        <input
          id="btcReceived"
          type="number"
          name="btcReceived"
          value={formData.btcReceived}
          onChange={handleChange}
          placeholder="0.00000000"
          min="0"
          step="0.00000001"
        />
        {errors.btcReceived && (
          <span className="error-message">{errors.btcReceived}</span>
        )}
        <small className="field-hint">
          กรอกจำนวน BTC ที่ได้รับจริงจาก Bitkub (หลังหักค่าธรรมเนียม)
        </small>
      </div>

      <button type="submit" className="submit-button">
        เพิ่มข้อมูล
      </button>
    </form>
  )
}

PurchaseForm.propTypes = {
  onAddPurchase: PropTypes.func.isRequired
}

export default PurchaseForm
