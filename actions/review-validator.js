// Lightweight validators for actions (no UI imports)

function isRequiredFieldValid(value) {
  return value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '');
}

function isRatingValid(value) {
  const n = Number(value);
  return !isNaN(n) && n >= 1 && n <= 5;
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { isRequiredFieldValid, isRatingValid, isEmailValid };
