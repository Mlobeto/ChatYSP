const phonePatterns = {
  AR: {
    pattern: /^\+549(11|15)\d{8}$|^\+54(3[0-9]|2[0-9]|1[1-9])\d{6,8}$/,
    example: '+5491123456789',
    description: 'Argentina: +54 + area code + number',
  },
  PE: {
    pattern: /^\+51[9]\d{8}$/,
    example: '+51987654321',
    description: 'Perú: +51 + 9 + 8 digits',
  },
  MX: {
    pattern: /^\+52[1-9]\d{9}$/,
    example: '+52155123456789',
    description: 'México: +52 + area code + number',
  },
  CO: {
    pattern: /^\+57[3]\d{9}$/,
    example: '+573123456789',
    description: 'Colombia: +57 + 3 + 9 digits',
  },
  ES: {
    pattern: /^\+34[6789]\d{8}$/,
    example: '+34612345678',
    description: 'España: +34 + 6/7/8/9 + 8 digits',
  },
};

/**
 * Validate phone number for a specific country
 * @param {string} phone - Phone number to validate
 * @param {string} country - Country code (AR, PE, MX, CO, ES)
 * @returns {object} - Validation result with success and message
 */
const validatePhoneForCountry = (phone, country) => {
  if (!phone || !country) {
    return {
      success: false,
      message: 'Teléfono y país son requeridos',
    };
  }

  const countryData = phonePatterns[country];
  if (!countryData) {
    return {
      success: false,
      message: 'País no soportado',
    };
  }

  if (!countryData.pattern.test(phone)) {
    const errorMessage = `Formato inválido para ${country}. `
      + `${countryData.description}. Ejemplo: ${countryData.example}`;
    return {
      success: false,
      message: errorMessage,
    };
  }

  return {
    success: true,
    message: 'Teléfono válido',
  };
};

/**
 * Get country from phone number
 * @param {string} phone - Phone number
 * @returns {string|null} - Country code or null if not found
 */
const getCountryFromPhone = (phone) => {
  if (!phone) return null;

  const matchedCountry = Object.entries(phonePatterns)
    .find(([, data]) => data.pattern.test(phone));
  return matchedCountry ? matchedCountry[0] : null;
};

/**
 * Get all supported countries with examples
 * @returns {object} - Countries with their phone patterns and examples
 */
const getSupportedCountries = () => phonePatterns;

module.exports = {
  validatePhoneForCountry,
  getCountryFromPhone,
  getSupportedCountries,
};
