// src/services/postgres/AuthenticationsService.js
import InvariantError from '../../exceptions/InvariantError.js';
import pool from './Pool.js';

class AuthenticationsService {
  constructor() {
    this._pool = pool;
  }

  // Nambahin refresh token ke db
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };
    await this._pool.query(query);
  }

  // Cek kalo refresh token ada di db
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  // Hapus refresh token dari db (buat logout)
  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token); // Pastiin tokennya ada dulu
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    await this._pool.query(query);
  }
}

export default AuthenticationsService;