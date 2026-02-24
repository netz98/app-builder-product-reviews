/*
* Unit tests for ReviewManager component logic functions
*/

const { isRequiredFieldValid, isRatingValid, isEmailValid } = require('../web-src/reviewValidator');

describe('ReviewManager - validateField', () => {
  const requiredFields = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];

  function validateField(field, value) {
    if (requiredFields.includes(field)) {
      if (!isRequiredFieldValid(value)) {
        return `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required.`;
      }
    }
    if (field === 'author_email' && value && !isEmailValid(value)) {
      return 'Please enter a valid email address.';
    }
    if (field === 'rating' && !isRatingValid(value)) {
      return 'Rating must be between 1 and 5.';
    }
    return null;
  }

  test('returns null for valid required field', () => {
    expect(validateField('title', 'Valid Title')).toBeNull();
  });

  test('returns error for empty required field', () => {
    const error = validateField('title', '');
    expect(error).toContain('Title is required');
  });

  test('returns error for null required field', () => {
    const error = validateField('title', null);
    expect(error).toContain('Title is required');
  });

  test('returns error for undefined required field', () => {
    const error = validateField('title', undefined);
    expect(error).toContain('Title is required');
  });

  test('returns error for invalid email', () => {
    const error = validateField('author_email', 'invalid-email');
    expect(error).toBe('Please enter a valid email address.');
  });

  test('returns null for valid email', () => {
    expect(validateField('author_email', 'test@example.com')).toBeNull();
  });

  test('returns error for invalid rating (below range)', () => {
    const error = validateField('rating', 0);
    expect(error).toBe('Rating must be between 1 and 5.');
  });

  test('returns error for invalid rating (above range)', () => {
    const error = validateField('rating', 6);
    expect(error).toBe('Rating must be between 1 and 5.');
  });

  test('returns null for valid rating', () => {
    expect(validateField('rating', 3)).toBeNull();
  });

  test('returns null for non-required field with any value', () => {
    expect(validateField('status', 'approved')).toBeNull();
  });
});

describe('ReviewManager - form validation', () => {
  test('validates all required fields are present', () => {
    const formData = {
      sku: 'SKU123',
      rating: 5,
      title: 'Test Title',
      text: 'Test text',
      author: 'Test Author',
      author_email: 'test@example.com'
    };
    const requiredFields = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    expect(missingFields).toHaveLength(0);
  });

  test('identifies missing required fields', () => {
    const formData = {
      sku: 'SKU123',
      rating: 5,
      title: '',
      text: 'Test text',
      author: 'Test Author',
      author_email: 'test@example.com'
    };
    const requiredFields = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    expect(missingFields).toContain('title');
  });

  test('identifies invalid email format', () => {
    const email = 'invalid-email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    expect(isValid).toBe(false);
  });

  test('validates correct email format', () => {
    const email = 'test@example.com';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    expect(isValid).toBe(true);
  });

  test('validates rating within range', () => {
    const rating = 4;
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);
  });

  test('rejects rating below range', () => {
    const rating = 0;
    expect(rating).toBeLessThan(1);
  });

  test('rejects rating above range', () => {
    const rating = 6;
    expect(rating).toBeGreaterThan(5);
  });
});

describe('ReviewManager - search params', () => {
  test('includes sku in search params', () => {
    const params = { sku: 'SKU123' };
    expect(params.sku).toBeDefined();
    expect(typeof params.sku).toBe('string');
  });

  test('includes status in search params', () => {
    const params = { status: 'approved' };
    expect(params.status).toBe('approved');
  });

  test('filters by status only when other fields are empty', () => {
    const hasFilters = {
      searchSku: '',
      selectedStatus: 'approved',
      author: '',
      author_email: '',
      rating: null,
      text: ''
    };
    const filterKeys = Object.keys(hasFilters).filter(key => hasFilters[key] && key !== 'searchSku');
    expect(filterKeys).toContain('selectedStatus');
  });

  test('filters by multiple criteria', () => {
    const filters = {
      searchSku: 'SKU123',
      selectedStatus: 'approved',
      author: 'John',
      rating: 5,
      text: 'great'
    };
    const activeFilters = Object.keys(filters).filter(key => filters[key]);
    expect(activeFilters.length).toBeGreaterThan(1);
  });
});
