import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import NotificationService from '../services/NotificationService'
import './PriceAlert.css'

/**
 * PriceAlert component - Manage price alerts and notifications
 * @param {number} currentBTCPrice - Current Bitcoin price
 * @param {Array} alerts - Array of alert objects
 * @param {function} onAddAlert - Callback to add new alert
 * @param {function} onDeleteAlert - Callback to delete alert
 * @param {function} onUpdateAlert - Callback to update alert triggered status
 */
function PriceAlert({ currentBTCPrice, alerts, onAddAlert, onDeleteAlert, onUpdateAlert }) {
  // Local state for form fields
  const [formData, setFormData] = useState({
    targetPrice: '',
    alertType: 'above'
  })

  // State for validation errors
  const [errors, setErrors] = useState({})

  // State for notification banner
  const [notification, setNotification] = useState(null)

  // State for permission status
  const [permissionStatus, setPermissionStatus] = useState(
    NotificationService.getPermissionStatus()
  )

  /**
   * Check alerts whenever price or alerts change
   */
  useEffect(() => {
    if (currentBTCPrice > 0 && alerts.length > 0) {
      checkAlerts()
    }
  }, [currentBTCPrice, alerts])

  /**
   * Check if any alerts should trigger
   */
  const checkAlerts = () => {
    alerts.forEach(alert => {
      // Skip if already triggered
      if (alert.triggered) {
        return
      }

      let shouldTrigger = false

      // Check if alert condition is met
      if (alert.type === 'above' && currentBTCPrice >= alert.targetPrice) {
        shouldTrigger = true
      } else if (alert.type === 'below' && currentBTCPrice <= alert.targetPrice) {
        shouldTrigger = true
      }

      if (shouldTrigger) {
        triggerAlert(alert)
      }
    })
  }

  /**
   * Trigger an alert notification
   */
  const triggerAlert = (alert) => {
    const typeText = alert.type === 'above' ? 'สูงกว่า' : 'ต่ำกว่า'
    const title = '🔔 แจ้งเตือนราคา Bitcoin'
    const body = `ราคา Bitcoin ปัจจุบัน ฿${currentBTCPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ${typeText} เป้าหมาย ฿${alert.targetPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`

    // Show browser notification
    NotificationService.showNotification(title, body)

    // Show in-app notification banner
    setNotification({
      id: alert.id,
      message: body
    })

    // Mark alert as triggered
    onUpdateAlert(alert.id, true)

    // Auto-hide notification after 10 seconds
    setTimeout(() => {
      setNotification(null)
    }, 10000)
  }

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors = {}

    // Validate target price (required, positive number)
    if (!formData.targetPrice) {
      newErrors.targetPrice = 'กรุณากรอกราคาเป้าหมาย'
    } else if (parseFloat(formData.targetPrice) <= 0) {
      newErrors.targetPrice = 'ราคาต้องมากกว่า 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    // Request notification permission if this is the first alert
    if (alerts.length === 0) {
      const hasPermission = await NotificationService.requestPermission()
      setPermissionStatus(NotificationService.getPermissionStatus())
      
      if (!hasPermission && NotificationService.isSupported()) {
        alert('กรุณาอนุญาตการแจ้งเตือนเพื่อรับการแจ้งเตือนราคา')
      }
    }

    // Create alert object
    const alert = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      targetPrice: parseFloat(formData.targetPrice),
      type: formData.alertType,
      triggered: false,
      createdAt: new Date().toISOString()
    }

    // Pass to parent
    onAddAlert(alert)

    // Reset form
    setFormData({
      targetPrice: '',
      alertType: 'above'
    })
    setErrors({})
  }

  /**
   * Handle alert deletion
   */
  const handleDelete = (alertId) => {
    onDeleteAlert(alertId)
  }

  /**
   * Close notification banner
   */
  const closeNotification = () => {
    setNotification(null)
  }

  return (
    <div className="price-alert">
      {/* Notification Banner */}
      {notification && (
        <div className="alert-notification">
          <div className="alert-notification-content">
            <span className="alert-icon">🔔</span>
            <span className="alert-message">{notification.message}</span>
            <button 
              className="alert-close"
              onClick={closeNotification}
              aria-label="ปิดการแจ้งเตือน"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <h3>ตั้งค่าแจ้งเตือนราคา</h3>

      {/* Browser notification support warning */}
      {!NotificationService.isSupported() && (
        <div className="alert-warning">
          ⚠️ เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน
        </div>
      )}

      {/* Permission denied warning */}
      {NotificationService.isSupported() && permissionStatus === 'denied' && (
        <div className="alert-warning">
          ⚠️ คุณได้ปฏิเสธการแจ้งเตือน กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์
        </div>
      )}

      {/* Alert Form */}
      <form className="alert-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="targetPrice">ราคาเป้าหมาย (บาท)</label>
            <input
              id="targetPrice"
              type="number"
              name="targetPrice"
              value={formData.targetPrice}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.targetPrice && (
              <span className="error-message">{errors.targetPrice}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="alertType">ประเภทการแจ้งเตือน</label>
            <select
              id="alertType"
              name="alertType"
              value={formData.alertType}
              onChange={handleChange}
            >
              <option value="above">เมื่อราคาสูงกว่า</option>
              <option value="below">เมื่อราคาต่ำกว่า</option>
            </select>
          </div>

          <button type="submit" className="submit-button">
            เพิ่มการแจ้งเตือน
          </button>
        </div>
      </form>

      {/* Alert List */}
      {alerts.length > 0 && (
        <div className="alert-list">
          <h4>การแจ้งเตือนที่ตั้งไว้</h4>
          <div className="alert-items">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`alert-item ${alert.triggered ? 'triggered' : ''}`}
              >
                <div className="alert-info">
                  <span className="alert-price">
                    ฿{alert.targetPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="alert-type">
                    {alert.type === 'above' ? '📈 สูงกว่า' : '📉 ต่ำกว่า'}
                  </span>
                  {alert.triggered && (
                    <span className="alert-status">✓ ทำงานแล้ว</span>
                  )}
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(alert.id)}
                  aria-label="ลบการแจ้งเตือน"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <p className="no-alerts">ยังไม่มีการแจ้งเตือน</p>
      )}
    </div>
  )
}

PriceAlert.propTypes = {
  currentBTCPrice: PropTypes.number.isRequired,
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      targetPrice: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['above', 'below']).isRequired,
      triggered: PropTypes.bool.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ).isRequired,
  onAddAlert: PropTypes.func.isRequired,
  onDeleteAlert: PropTypes.func.isRequired,
  onUpdateAlert: PropTypes.func.isRequired
}

export default PriceAlert
