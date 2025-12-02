// src/exceptions/AuthorizationError.js
import ClientError from './ClientError.js';

// Error ini spesifik buat 403 Forbidden (ga punya hak akses)
class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export default AuthorizationError;