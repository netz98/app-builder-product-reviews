/*
* Unit tests for review.js - Review model and validation functions
*/

const { createReview, updateReview, validateReview, parseReview, SEARCHABLE_FIELDS } = require('../actions/review');

describe('validateReview', () => {
  test('passes with all valid required fields', () => {
    const review = {
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com'
    };
    const error = validateReview(review);
    expect(error).toBeNull();
  });

  test('fails with missing required field', () => {
    const review = {
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe'
    };
    const error = validateReview(review);
    expect(error).toContain('Missing required field: author_email');
  });

  test('fails with invalid email', () => {
    const review = {
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'invalid-email'
    };
    const error = validateReview(review);
    expect(error).toBe('Invalid email format for author_email.');
  });

  test('fails with invalid rating', () => {
    const review = {
      sku: 'SKU12345',
      rating: 6,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com'
    };
    const error = validateReview(review);
    expect(error).toBe('Rating must be a number between 1 and 5.');
  });

  test('passes with valid status provided', () => {
    const review = {
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'approved'
    };
    const error = validateReview(review);
    expect(error).toBeNull();
  });

  test('passes partial update with partial: true', () => {
    const review = {
      title: 'Updated title',
      status: 'approved'
    };
    const error = validateReview(review, { partial: true });
    expect(error).toBeNull();
  });
});

describe('createReview', () => {
  test('creates review with all required fields', () => {
    const params = {
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com'
    };
    const review = createReview(params);

    expect(review).toMatchObject({
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'pending'
    });
    expect(review.id).toBeDefined();
    expect(review.created_at).toBeDefined();
    expect(review.updated_at).toBeDefined();
    expect(review.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test('throws error on invalid review', () => {
    const params = {
      sku: 'SKU12345',
      rating: 6,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com'
    };
    expect(() => createReview(params)).toThrow('Rating must be a number between 1 and 5.');
  });

  test('sets provided status', () => {
    const params = {
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'approved'
    };
    const review = createReview(params);
    expect(review.status).toBe('approved');
  });

  test('converts rating to integer', () => {
    const params = {
      sku: 'SKU12345',
      rating: '5',
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com'
    };
    const review = createReview(params);
    expect(review.rating).toBe(5);
    expect(typeof review.rating).toBe('number');
  });
});

describe('updateReview', () => {
  test('updates only provided fields', () => {
    const existing = {
      id: 'test-id',
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'pending',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };
    const params = { title: 'Updated title', status: 'approved' };
    const updated = updateReview(existing, params);

    expect(updated.title).toBe('Updated title');
    expect(updated.status).toBe('approved');
    expect(updated.rating).toBe(5);
    expect(updated.text).toBe('Excellent');
  });

  test('updates updated_at timestamp', () => {
    const existing = {
      id: 'test-id',
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'pending',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };
    const params = { title: 'Updated title' };
    const updated = updateReview(existing, params);

    expect(updated.created_at).toBe('2025-01-01T00:00:00Z');
    expect(updated.updated_at).not.toBe('2025-01-01T00:00:00Z');
  });

  test('converts rating to integer', () => {
    const existing = {
      id: 'test-id',
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'pending',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };
    const params = { rating: '4' };
    const updated = updateReview(existing, params);

    expect(updated.rating).toBe(4);
    expect(typeof updated.rating).toBe('number');
  });

  test('throws error on invalid update', () => {
    const existing = {
      id: 'test-id',
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'pending',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };
    const params = { rating: 6 };
    expect(() => updateReview(existing, params)).toThrow('Rating must be a number between 1 and 5.');
  });

  test('does not update id field', () => {
    const existing = {
      id: 'test-id',
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'pending',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };
    const params = { id: 'new-id', title: 'Updated' };
    const updated = updateReview(existing, params);

    expect(updated.id).toBe('test-id');
    expect(updated.title).toBe('Updated');
  });
});

describe('parseReview', () => {
  test('parses valid JSON review', () => {
    const reviewJson = JSON.stringify({
      id: 'test-id',
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'pending'
    });
    const parsed = parseReview(reviewJson);

    expect(parsed).toEqual(expect.objectContaining({
      id: 'test-id',
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product'
    }));
  });

  test('returns null for invalid JSON', () => {
    const parsed = parseReview('invalid json');
    expect(parsed).toBeNull();
  });

  test('returns null for invalid review', () => {
    const invalidJson = JSON.stringify({ sku: 'test', author_email: 'invalid' });
    const parsed = parseReview(invalidJson);
    expect(parsed).toBeNull();
  });

  test('returns null for null input', () => {
    const parsed = parseReview(null);
    expect(parsed).toBeNull();
  });

  test('returns null for undefined input', () => {
    const parsed = parseReview(undefined);
    expect(parsed).toBeNull();
  });

  test('parses review object directly', () => {
    const reviewObj = {
      id: 'test-id',
      sku: 'SKU12345',
      rating: 5,
      title: 'Great product',
      text: 'Excellent',
      author: 'John Doe',
      author_email: 'john@example.com',
      status: 'pending'
    };
    const parsed = parseReview(reviewObj);
    expect(parsed).toEqual(reviewObj);
  });
});

describe('SEARCHABLE_FIELDS', () => {
  test('contains expected fields', () => {
    expect(SEARCHABLE_FIELDS).toEqual([
      'sku', 'rating', 'title', 'text', 'author', 'author_email', 'status'
    ]);
  });

  test('is an array', () => {
    expect(Array.isArray(SEARCHABLE_FIELDS)).toBe(true);
  });
});
