// src/tokenize/TokenManager.js
import Jwt from '@hapi/jwt';
import InvariantError from '../exceptions/InvariantError.js';

const TokenManager = {
  // Bikin Access Token
  generateAccessToken: (payload) => Jwt.token.generate(
    payload,
    process.env.ACCESS_TOKEN_KEY,
  ),

  // Bikin Refresh Token
  generateRefreshToken: (payload) => Jwt.token.generate(
    payload,
    process.env.REFRESH_TOKEN_KEY,
  ),

  // Verifikasi Refresh Token
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (_error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

export default TokenManager;