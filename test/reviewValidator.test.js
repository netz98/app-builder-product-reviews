/*
* Unit tests for reviewValidator.js - Validation helpers used by frontend and backend
*/

const { isRequiredFieldValid, isRatingValid, isEmailValid } = require('../web-src/reviewValidator');

describe('isRequiredFieldValid', () => {
  test('returns true for non-empty string', () => {
    expect(isRequiredFieldValid('test')).toBe(true);
  });

  test('returns true for string with spaces', () => {
    expect(isRequiredFieldValid('  test  ')).toBe(true);
  });

  test('returns false for empty string', () => {
    expect(isRequiredFieldValid('')).toBe(false);
  });

  test('returns false for whitespace-only string', () => {
    expect(isRequiredFieldValid('   ')).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isRequiredFieldValid(undefined)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isRequiredFieldValid(null)).toBe(false);
  });

  test('returns true for number 0', () => {
    expect(isRequiredFieldValid(0)).toBe(true);
  });

  test('returns true for boolean false', () => {
    expect(isRequiredFieldValid(false)).toBe(true);
  });
});

describe('isRatingValid', () => {
  test('returns true for valid ratings 1-5', () => {
    expect(isRatingValid(1)).toBe(true);
    expect(isRatingValid(2)).toBe(true);
    expect(isRatingValid(3)).toBe(true);
    expect(isRatingValid(4)).toBe(true);
    expect(isRatingValid(5)).toBe(true);
  });

  test('returns true for string numbers 1-5', () => {
    expect(isRatingValid('1')).toBe(true);
    expect(isRatingValid('2')).toBe(true);
    expect(isRatingValid('3')).toBe(true);
    expect(isRatingValid('4')).toBe(true);
    expect(isRatingValid('5')).toBe(true);
  });

  test('returns true for decimal ratings within range', () => {
    expect(isRatingValid(1.0)).toBe(true);
    expect(isRatingValid(3.5)).toBe(true);
    expect(isRatingValid(5.0)).toBe(true);
  });

  test('returns false for rating 0', () => {
    expect(isRatingValid(0)).toBe(false);
  });

  test('returns false for rating 6', () => {
    expect(isRatingValid(6)).toBe(false);
  });

  test('returns false for negative rating', () => {
    expect(isRatingValid(-1)).toBe(false);
    expect(isRatingValid(-5)).toBe(false);
  });

  test('returns false for very large rating', () => {
    expect(isRatingValid(100)).toBe(false);
    expect(isRatingValid(999)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isRatingValid(undefined)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isRatingValid(null)).toBe(false);
  });

  test('returns false for NaN', () => {
    expect(isRatingValid(NaN)).toBe(false);
  });

  test('returns false for non-numeric string', () => {
    expect(isRatingValid('abc')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isRatingValid('')).toBe(false);
  });
});

describe('isEmailValid', () => {
  test('returns true for valid simple email', () => {
    expect(isEmailValid('user@example.com')).toBe(true);
  });

  test('returns true for email with subdomain', () => {
    expect(isEmailValid('user@mail.example.com')).toBe(true);
  });

  test('returns true for email with numbers', () => {
    expect(isEmailValid('user123@example456.com')).toBe(true);
  });

  test('returns true for email with dots in local part', () => {
    expect(isEmailValid('first.last@example.com')).toBe(true);
  });

  test('returns true for email with plus sign', () => {
    expect(isEmailValid('user+tag@example.com')).toBe(true);
  });

  test('returns true for email with hyphen', () => {
    expect(isEmailValid('user-name@example.com')).toBe(true);
  });

  test('returns false for email without @', () => {
    expect(isEmailValid('userexample.com')).toBe(false);
  });

  test('returns false for email without domain part', () => {
    expect(isEmailValid('user@')).toBe(false);
  });

  test('returns false for email without local part', () => {
    expect(isEmailValid('@example.com')).toBe(false);
  });

  test('returns false for email without domain extension', () => {
    expect(isEmailValid('user@example')).toBe(false);
  });

  test('returns false for email without dot in domain', () => {
    expect(isEmailValid('user@examplecom')).toBe(false);
  });

  test('returns false for email with whitespace', () => {
    expect(isEmailValid('user @example.com')).toBe(false);
    expect(isEmailValid('user@example .com')).toBe(false);
    expect(isEmailValid(' user@example.com')).toBe(false);
    expect(isEmailValid('user@example.com ')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isEmailValid('')).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isEmailValid(undefined)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isEmailValid(null)).toBe(false);
  });

  test('returns false for email with multiple @ symbols', () => {
    expect(isEmailValid('user@@example.com')).toBe(false);
    expect(isEmailValid('u@ser@example.com')).toBe(false);
  });

  test('returns false for email with @ in domain', () => {
    expect(isEmailValid('user@example@com')).toBe(false);
  });
});
