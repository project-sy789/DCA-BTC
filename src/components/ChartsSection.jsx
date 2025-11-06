import PropTypes from 'prop-types';
import ROIChart from './ROIChart';
import BTCAccumulationChart from './BTCAccumulationChart';
import PortfolioValueChart from './PortfolioValueChart';
import './ChartsSection.css';

const ChartsSection = ({ purchases, currentBTCPrice }) => {
  // Calculate cost basis (average buy price)
  const costBasis = purchases.length > 0
    ? purchases.reduce((sum, p) => sum + p.investmentAmount, 0) / 
      purchases.reduce((sum, p) => sum + p.btcReceived, 0)
    : 0;

  return (
    <section className="charts-section">
      <ROIChart 
        purchases={purchases} 
        currentBTCPrice={currentBTCPrice} 
      />
      <BTCAccumulationChart 
        purchases={purchases} 
        currentBTCPrice={currentBTCPrice} 
      />
      <PortfolioValueChart 
        purchases={purchases} 
        currentBTCPrice={currentBTCPrice}
        costBasis={costBasis}
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
