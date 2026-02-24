// Centralized review field validators for both backend and frontend

/**
 * Checks if a required field is valid (not undefined, null, or empty/whitespace string)
 * @param {any} value
 * @returns {boolean}
 */
function isRequiredFieldValid(value) {
  return value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '');
}

/**
 * Checks if a rating is valid (number between 1 and 5)
 * @param {any} value
 * @returns {boolean}
 */
function isRatingValid(value) {
  const n = Number(value);
  return !isNaN(n) && n >= 1 && n <= 5;
}

/**
 * Checks if an email is valid (no whitespace, at least one dot in domain, no @ in local part)
 * @param {string} email
 * @returns {boolean}
 */
function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { isRequiredFieldValid, isRatingValid, isEmailValid };
