import PropTypes from 'prop-types';
import BTCAccumulationChart from './BTCAccumulationChart';
import PortfolioValueChart from './PortfolioValueChart';
import './ChartsSection.css';

const ChartsSection = ({ purchases, currentBTCPrice }) => {
  return (
    <section className="charts-section">
      <BTCAccumulationChart 
        purchases={purchases} 
        currentBTCPrice={currentBTCPrice} 
      />
      <PortfolioValueChart 
        purchases={purchases} 
        currentBTCPrice={currentBTCPrice} 
      />
    </section>
  );
};

ChartsSection.propTypes = {
  purchases: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      investmentAmount: PropTypes.number.isRequired,
      btcPrice: PropTypes.number.isRequired,
      btcReceived: PropTypes.number.isRequired
    })
  ).isRequired,
  currentBTCPrice: PropTypes.number.isRequired
};

export default ChartsSection;
