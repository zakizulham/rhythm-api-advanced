// src/exceptions/NotFoundError.js
import ClientError from './ClientError.js';

// Error spesifik buat 404 Not Found
class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export default NotFoundError;