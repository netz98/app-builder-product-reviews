// Centralized Review schema and helpers
const { v4: uuidv4 } = require('uuid');
const { isRequiredFieldValid, isRatingValid, isEmailValid } = require('./review-validator');

const REQUIRED_FIELDS = ['sku', 'rating', 'title', 'text', 'author', 'author_email'];
const SEARCHABLE_FIELDS = ['sku', 'rating', 'title', 'text', 'author', 'author_email', 'status'];

function validateReview(params, { partial = false } = {}) {
  // For creation, all fields required; for update, only validate present fields
  for (const field of REQUIRED_FIELDS) {
    if (!partial && !isRequiredFieldValid(params[field])) {
      return `Missing required field: ${field}`;
    }
    if (field in params && !isRequiredFieldValid(params[field])) {
      return `Missing required field: ${field}`;
    }
  }
  if ('author_email' in params && !isEmailValid(params.author_email)) {
    return 'Invalid email format for author_email.';
  }
  if ('rating' in params && !isRatingValid(params.rating)) {
    return 'Rating must be a number between 1 and 5.';
  }
  return null;
}

function createReview(params) {
  const error = validateReview(params);
  if (error) throw new Error(error);
  const now = new Date().toISOString();
  const reviewId = uuidv4();
  return {
    id: reviewId,
    sku: params.sku,
    rating: parseInt(params.rating, 10),
    title: params.title,
    text: params.text,
    author: params.author,
    author_email: params.author_email,
    status: params.status || 'pending',
    created_at: now,
    updated_at: now
  };
}

function updateReview(existing, params) {
  // Only update fields present in params
  const updated = { ...existing };
  for (const key of Object.keys(params)) {
    if (key !== 'id' && key in existing) {
      updated[key] = key === 'rating' ? parseInt(params[key], 10) : params[key];
    }
  }
  updated.updated_at = new Date().toISOString();
  const error = validateReview(updated, { partial: true });
  if (error) throw new Error(error);
  return updated;
}

function parseReview(raw) {
  if (!raw) return null;
  let obj = raw;
  if (typeof raw === 'string') {
    try { obj = JSON.parse(raw); } catch { return null; }
  }
  const error = validateReview(obj, { partial: true });
  if (error) return null;
  return obj;
}

module.exports = {
  createReview,
  updateReview,
  validateReview,
  parseReview,
  SEARCHABLE_FIELDS
};
