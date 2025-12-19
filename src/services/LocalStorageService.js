/**
 * LocalStorageService - Handles all localStorage operations for the DCA Bitcoin Tracker
 * Provides data persistence with validation and error handling
 */

const STORAGE_KEY = 'dca-bitcoin-tracker-data';

// Default data structure for initial state
const DEFAULT_DATA = {
  purchases: [],
  currentBTCPrice: 0,
  alerts: [],
  lastUpdated: null
};

class LocalStorageService {
  /**
   * Load data from localStorage
   * @returns {Object} The stored data or default data if none exists or data is corrupted
   */
  static loadData() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      
      // Return default data if nothing is stored
      if (!storedData) {
        return { ...DEFAULT_DATA };
      }

      // Parse the stored data
      const parsedData = JSON.parse(storedData);
      
      // Validate the data structure
      if (!this.validateData(parsedData)) {
        console.warn('Corrupted data detected in localStorage. Using default data.');
        return { ...DEFAULT_DATA };
      }

      return parsedData;
    } catch (error) {
      // Handle JSON parse errors or other localStorage errors
      console.error('Error loading data from localStorage:', error);
      return { ...DEFAULT_DATA };
    }
  }

  /**
   * Save data to localStorage
   * @param {Object} data - The data to save
   * @returns {boolean} True if save was successful, false otherwise
   */
  static saveData(data) {
    try {
      // Validate data before saving
      if (!this.validateData(data)) {
        console.error('Invalid data structure. Cannot save to localStorage.');
        return false;
      }

      // Add timestamp for last update
      const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString()
      };

      const serializedData = JSON.stringify(dataToSave);
      localStorage.setItem(STORAGE_KEY, serializedData);
      return true;
    } catch (error) {
      // Handle quota exceeded errors and other localStorage errors
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Unable to save data.');
        alert('Storage limit reached. Please delete some purchase records to free up space.');
      } else {
        console.error('Error saving data to localStorage:', error);
      }
      return false;
    }
  }

  /**
   * Clear all data from localStorage
   * @returns {boolean} True if clear was successful, false otherwise
   */
  static clearData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data from localStorage:', error);
      return false;
    }
  }

  /**
   * Validate data structure
   * @param {Object} data - The data to validate
   * @returns {boolean} True if data is valid, false otherwise
   */
  static validateData(data) {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check if purchases array exists and is an array
    if (!Array.isArray(data.purchases)) {
      return false;
    }

    // Check if currentBTCPrice exists and is a number
    if (typeof data.currentBTCPrice !== 'number') {
      return false;
    }

    // Check if alerts array exists and is an array (optional for backward compatibility)
    if (data.alerts !== undefined && !Array.isArray(data.alerts)) {
      return false;
    }

    // Validate each purchase record
    for (const purchase of data.purchases) {
      if (!this.validatePurchase(purchase)) {
        return false;
      }
    }

    // Validate each alert record if alerts exist
    if (data.alerts) {
      for (const alert of data.alerts) {
        if (!this.validateAlert(alert)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate individual purchase record
   * @param {Object} purchase - The purchase record to validate
   * @returns {boolean} True if purchase is valid, false otherwise
   */
  static validatePurchase(purchase) {
    if (!purchase || typeof purchase !== 'object') {
      return false;
    }

    // Required fields: date, investmentAmount, btcPrice, btcReceived
    const requiredFields = ['date', 'investmentAmount', 'btcPrice', 'btcReceived'];
    
    for (const field of requiredFields) {
      if (!(field in purchase)) {
        return false;
      }
    }

    // Validate field types
    if (typeof purchase.date !== 'string') {
      return false;
    }

    if (typeof purchase.investmentAmount !== 'number' || purchase.investmentAmount <= 0) {
      return false;
    }

    if (typeof purchase.btcPrice !== 'number' || purchase.btcPrice <= 0) {
      return false;
    }

    if (typeof purchase.btcReceived !== 'number' || purchase.btcReceived <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Validate individual alert record
   * @param {Object} alert - The alert record to validate
   * @returns {boolean} True if alert is valid, false otherwise
   */
  static validateAlert(alert) {
    if (!alert || typeof alert !== 'object') {
      return false;
    }

    // Required fields: id, targetPrice, type, triggered, createdAt
    const requiredFields = ['id', 'targetPrice', 'type', 'triggered', 'createdAt'];
    
    for (const field of requiredFields) {
      if (!(field in alert)) {
        return false;
      }
    }

    // Validate field types
    if (typeof alert.id !== 'string') {
      return false;
    }

    if (typeof alert.targetPrice !== 'number' || alert.targetPrice <= 0) {
      return false;
    }

    if (alert.type !== 'above' && alert.type !== 'below') {
      return false;
    }

    if (typeof alert.triggered !== 'boolean') {
      return false;
    }

    if (typeof alert.createdAt !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * Add a new alert
   * @param {Object} data - Current data object
   * @param {Object} alert - The alert to add
   * @returns {Object} Updated data object
   */
  static addAlert(data, alert) {
    // Ensure alerts array exists
    if (!data.alerts) {
      data.alerts = [];
    }

    // Validate alert before adding
    if (!this.validateAlert(alert)) {
      console.error('Invalid alert data. Cannot add alert.');
      return data;
    }

    // Add alert to array
    const updatedData = {
      ...data,
      alerts: [...data.alerts, alert]
    };

    return updatedData;
  }

  /**
   * Delete an alert by ID
   * @param {Object} data - Current data object
   * @param {string} alertId - The ID of the alert to delete
   * @returns {Object} Updated data object
   */
  static deleteAlert(data, alertId) {
    // Ensure alerts array exists
    if (!data.alerts) {
      return data;
    }

    // Filter out the alert with matching ID
    const updatedData = {
      ...data,
      alerts: data.alerts.filter(alert => alert.id !== alertId)
    };

    return updatedData;
  }

  /**
   * Update an alert's triggered status
   * @param {Object} data - Current data object
   * @param {string} alertId - The ID of the alert to update
   * @param {boolean} triggered - The new triggered status
   * @returns {Object} Updated data object
   */
  static updateAlertTriggered(data, alertId, triggered) {
    // Ensure alerts array exists
    if (!data.alerts) {
      return data;
    }

    // Update the alert's triggered status
    const updatedData = {
      ...data,
      alerts: data.alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, triggered } 
          : alert
      )
    };

    return updatedData;
  }

  /**
   * Get all alerts
   * @param {Object} data - Current data object
   * @returns {Array} Array of alerts
   */
  static getAlerts(data) {
    return data.alerts || [];
  }

  /**
   * Get the default data structure
   * @returns {Object} A copy of the default data structure
   */
  static getDefaultData() {
    return { ...DEFAULT_DATA };
  }
}

export default LocalStorageService;
