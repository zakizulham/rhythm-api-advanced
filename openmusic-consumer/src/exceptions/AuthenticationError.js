// src/exceptions/AuthenticationError.js
import ClientError from './ClientError.js';

// Error spesifik buat 401 Unauthorized
class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export default AuthenticationError;