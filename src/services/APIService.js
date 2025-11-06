/**
 * APIService - Service for communicating with PHP backend API
 */

// API base URL - change this to your hosting URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

class APIService {
  /**
   * Load all data from API
   * @returns {Promise<Object>} - Object with purchases array and currentBTCPrice
   */
  static async loadData() {
    try {
      const response = await fetch(`${API_BASE_URL}/data.php`);
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      const data = await response.json();
      
      // Transform data to match frontend format
      const purchases = data.purchases.map(p => ({
        date: p.date,
        investmentAmount: parseFloat(p.investment_amount),
        btcPrice: parseFloat(p.btc_price),
        btcReceived: parseFloat(p.btc_received),
        id: p.id
      }));

      return {
        purchases,
        currentBTCPrice: data.currentBTCPrice
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return {
        purchases: [],
        currentBTCPrice: 0
      };
    }
  }

  /**
   * Add a new purchase
   * @param {Object} purchase - Purchase object
   * @returns {Promise<Object>} - Response from API
   */
  static async addPurchase(purchase) {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchase)
      });

      if (!response.ok) {
        throw new Error('Failed to add purchase');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding purchase:', error);
      throw error;
    }
  }

  /**
   * Update a purchase
   * @param {number} id - Purchase ID
   * @param {Object} purchase - Updated purchase object
   * @returns {Promise<Object>} - Response from API
   */
  static async updatePurchase(id, purchase) {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...purchase, id })
      });

      if (!response.ok) {
        throw new Error('Failed to update purchase');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating purchase:', error);
      throw error;
    }
  }

  /**
   * Delete a purchase
   * @param {number} id - Purchase ID
   * @returns {Promise<Object>} - Response from API
   */
  static async deletePurchase(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases.php?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }
  }

  /**
   * Update current BTC price
   * @param {number} price - New BTC price
   * @returns {Promise<Object>} - Response from API
   */
  static async updateCurrentPrice(price) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentBTCPrice: price })
      });

      if (!response.ok) {
        throw new Error('Failed to update current price');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating current price:', error);
      throw error;
    }
  }
}

export default APIService;
