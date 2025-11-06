import PropTypes from 'prop-types'
import './StatCard.css'

/**
 * StatCard component - Displays a statistic with icon, title, value, and unit
 * @param {string} icon - Icon or emoji to display
 * @param {string} title - Title of the statistic
 * @param {number|string} value - The value to display
 * @param {string} unit - Unit of measurement
 * @param {boolean} isProfit - Whether this represents a profit (for conditional styling)
 */
function StatCard({ icon, title, value, unit, isProfit = null }) {
  // Determine the CSS class based on profit/loss
  const valueClass = isProfit === null 
    ? 'stat-value' 
    : isProfit 
      ? 'stat-value positive' 
      : 'stat-value negative'

  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className={valueClass}>
          {value} {unit && <span className="stat-unit">{unit}</span>}
        </div>
      </div>
    </div>
  )
}

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  unit: PropTypes.string,
  isProfit: PropTypes.bool
}

export default StatCard
