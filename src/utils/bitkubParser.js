/**
 * Bitkub LINE Notification Parser
 * Parses Bitkub LINE notification text to extract purchase data
 */

/**
 * Parse Bitkub LINE notification text
 * @param {string} text - Raw text from Bitkub LINE notification
 * @returns {Object|null} - Parsed data object or null if invalid
 * 
 * Expected format:
 * 🤗🎉 You Spent : 108 THB
 * Price : 2716645.94 THB/BTC
 * You Received : 0.00003975 BTC
 * Time : 2025-12-18 07:46:51
 */
export function parseBitkubLineMessage(text) {
  if (!text || typeof text !== 'string') {
    return null
  }

  try {
    // Initialize result object
    const result = {
      investmentAmount: null,
      btcPrice: null,
      btcReceived: null,
      date: null
    }

    // Extract investment amount (You Spent : X THB)
    const spentMatch = text.match(/You Spent\s*:\s*([\d,.]+)\s*THB/i)
    if (spentMatch) {
      // Remove commas and parse as float
      result.investmentAmount = parseFloat(spentMatch[1].replace(/,/g, ''))
    }

    // Extract BTC price (Price : X THB/BTC)
    const priceMatch = text.match(/Price\s*:\s*([\d,.]+)\s*THB\/BTC/i)
    if (priceMatch) {
      result.btcPrice = parseFloat(priceMatch[1].replace(/,/g, ''))
    }

    // Extract BTC received (You Received : X BTC)
    const receivedMatch = text.match(/You Received\s*:\s*([\d.]+)\s*BTC/i)
    if (receivedMatch) {
      result.btcReceived = parseFloat(receivedMatch[1])
    }

    // Extract date and time (Time : YYYY-MM-DD HH:MM:SS)
    const timeMatch = text.match(/Time\s*:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/i)
    if (timeMatch) {
      result.date = timeMatch[1] // Just the date part (YYYY-MM-DD)
    }

    // Validate that we got all required fields
    if (
      result.investmentAmount === null ||
      result.btcPrice === null ||
      result.btcReceived === null ||
      result.date === null
    ) {
      return null
    }

    // Validate that numbers are positive
    if (
      result.investmentAmount <= 0 ||
      result.btcPrice <= 0 ||
      result.btcReceived <= 0
    ) {
      return null
    }

    return result
  } catch (error) {
    console.error('Error parsing Bitkub LINE message:', error)
    return null
  }
}

/**
 * Check if text looks like a Bitkub LINE notification
 * @param {string} text - Text to check
 * @returns {boolean} - True if text appears to be Bitkub format
 */
export function isBitkubLineMessage(text) {
  if (!text || typeof text !== 'string') {
    return false
  }

  // Check for key phrases that indicate Bitkub LINE message
  const hasSpent = /You Spent\s*:/i.test(text)
  const hasPrice = /Price\s*:.*THB\/BTC/i.test(text)
  const hasReceived = /You Received\s*:.*BTC/i.test(text)

  return hasSpent && hasPrice && hasReceived
}

export default {
  parseBitkubLineMessage,
  isBitkubLineMessage
}
