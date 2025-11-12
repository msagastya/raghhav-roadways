const { numberToWords } = require('number-to-words');

/**
 * Convert amount to words (Indian Rupees format)
 * @param {number} amount - Amount in decimal
 * @returns {string} - Amount in words
 */
const convertAmountToWords = (amount) => {
  try {
    if (!amount || amount === 0) {
      return 'Zero Rupees Only';
    }

    // Convert to positive number
    const absAmount = Math.abs(amount);
    
    // Split into rupees and paise
    const rupees = Math.floor(absAmount);
    const paise = Math.round((absAmount - rupees) * 100);

    let words = '';

    // Convert rupees
    if (rupees > 0) {
      const rupeesInWords = numberToWords.toWords(rupees);
      words = capitalizeFirstLetter(rupeesInWords) + ' Rupees';
    }

    // Convert paise
    if (paise > 0) {
      const paiseInWords = numberToWords.toWords(paise);
      if (words) {
        words += ' and ' + capitalizeFirstLetter(paiseInWords) + ' Paise';
      } else {
        words = capitalizeFirstLetter(paiseInWords) + ' Paise';
      }
    }

    words += ' Only';

    return words;
  } catch (error) {
    console.error('Error converting amount to words:', error);
    return 'Amount conversion error';
  }
};

/**
 * Capitalize first letter of string
 */
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Format amount in Indian numbering system (lakhs, crores)
 * @param {number} amount
 * @returns {string}
 */
const formatIndianCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};

module.exports = {
  convertAmountToWords,
  formatIndianCurrency,
};
