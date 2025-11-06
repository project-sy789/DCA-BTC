/**
 * BitkubService - Service for fetching BTC price from Bitkub Public API
 */

const BITKUB_API_URL = 'https://api.bitkub.com/api/market/ticker';

class BitkubService {
  /**
   * Fetch current BTC price from Bitkub
   * @returns {Promise<number>} - Current BTC price in THB
   */
  static async fetchBTCPrice() {
    try {
      const response = await fetch(`${BITKUB_API_URL}?sym=THB_BTC`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch BTC price');
      }

      const data = await response.json();
      
      // Bitkub API returns: { THB_BTC: { last: price, ... } }
      const btcData = data.THB_BTC;
      
      if (!btcData || !btcData.last) {
        throw new Error('Invalid response from Bitkub API');
      }

      return parseFloat(btcData.last);
    } catch (error) {
      console.error('Error fetching BTC price from Bitkub:', error);
      throw error;
    }
  }

  /**
   * Fetch ticker data with more details
   * @returns {Promise<Object>} - Ticker data
   */
  static async fetchTickerData() {
    try {
      const response = await fetch(`${BITKUB_API_URL}?sym=THB_BTC`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticker data');
      }

      const data = await response.json();
      const btcData = data.THB_BTC;
      
      if (!btcData) {
        throw new Error('Invalid response from Bitkub API');
      }

      return {
        last: parseFloat(btcData.last),
        high24h: parseFloat(btcData.high),
        low24h: parseFloat(btcData.low),
        percentChange: parseFloat(btcData.percentChange),
        volume24h: parseFloat(btcData.baseVolume),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error fetching ticker data from Bitkub:', error);
      throw error;
    }
  }
}

export default BitkubService;
