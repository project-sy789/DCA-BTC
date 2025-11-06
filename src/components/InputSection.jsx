import PropTypes from 'prop-types'
import CurrentPriceInput from './CurrentPriceInput'
import PurchaseForm from './PurchaseForm'
import './InputSection.css'

/**
 * InputSection component - Wrapper for input components
 * Combines CurrentPriceInput and PurchaseForm
 * @param {number} currentPrice - Current BTC price
 * @param {function} onPriceChange - Callback to update current price
 * @param {function} onAddPurchase - Callback to add new purchase
 */
function InputSection({ currentPrice, onPriceChange, onAddPurchase }) {
  return (
    <section className="input-section">
      <CurrentPriceInput 
        currentPrice={currentPrice}
        onPriceChange={onPriceChange}
      />
      <PurchaseForm 
        onAddPurchase={onAddPurchase}
      />
    </section>
  )
}

InputSection.propTypes = {
  currentPrice: PropTypes.number.isRequired,
  onPriceChange: PropTypes.func.isRequired,
  onAddPurchase: PropTypes.func.isRequired
}

export default InputSection
