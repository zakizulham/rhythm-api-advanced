// src/services/postgres/CollaborationsService.js
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import pool from './Pool.js';

class CollaborationsService {
  constructor() {
    this._pool = pool;
  }

  // Nambah kolaborator
  async addCollaboration(playlistId, userId) {
    // Cek dulu user-nya ada apa ngga
    const userQuery = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };
    const userResult = await this._pool.query(userQuery);
    if (!userResult.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  // Hapus kolaborator
  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  // Verifikasi kolaborator (ini sudah kita buat sebelumnya)
  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

export default CollaborationsService;