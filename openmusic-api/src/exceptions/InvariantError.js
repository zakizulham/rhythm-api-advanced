// src/exceptions/InvariantError.js
import ClientError from './ClientError.js';

// Error spesifik buat 400 Bad Request (validasi gagal, dll)
class InvariantError extends ClientError {
  constructor(message) {
    super(message);
    this.name = 'InvariantError';
  }
}

export default InvariantError;