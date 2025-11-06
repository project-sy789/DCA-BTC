/**
 * Calculate cumulative data for chart visualization
 * @param {Array} purchases - Array of purchase objects
 * @param {number} currentBTCPrice - Current BTC price
 * @returns {Array} Array of cumulative data points for charts
 */
export const calculateCumulativeData = (purchases, currentBTCPrice) => {
  // Return empty array if no purchases
  if (!purchases || purchases.length === 0) {
    return [];
  }

  // Sort purchases by date in ascending order
  const sortedPurchases = [...purchases].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // Calculate cumulative values for each purchase
  let cumulativeBTC = 0;
  let cumulativeInvestment = 0;

  const cumulativeData = sortedPurchases.map((purchase) => {
    cumulativeBTC += purchase.btcReceived;
    cumulativeInvestment += purchase.investmentAmount;
    
    // Calculate portfolio value at this point
    const portfolioValue = cumulativeBTC * currentBTCPrice;

    return {
      date: purchase.date,
      cumulativeBTC,
      cumulativeInvestment,
      portfolioValue
    };
  });

  return cumulativeData;
};
