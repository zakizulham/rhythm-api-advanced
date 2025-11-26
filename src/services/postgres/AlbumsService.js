// src/services/postgres/AlbumsService.js
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import ClientError from '../../exceptions/ClientError.js'; // Kita butuh ini buat cek error like ganda
import pool from './Pool.js';

class AlbumsService {
  // 1. TERIMA cacheService DI SINI
  constructor(cacheService) {
    this._pool = pool;
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      // Sekalian ambil coverUrl (karena kolomnya udah ada sekarang)
      text: 'SELECT id, name, year, "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  // --- FITUR LIKES V3 ---

  async addAlbumLike(albumId, userId) {
    // Cek dulu albumnya ada gak
    await this.getAlbumById(albumId);

    // Cek udah like belum (Query SQL langsung cek constraint unique)
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0].id) {
        throw new InvariantError('Like gagal ditambahkan');
      }
    } catch (error) {
      // Tangkep error constraint unique dari Postgres
      if (error.constraint === 'unique_user_album_likes') { 
        throw new InvariantError('Anda sudah menyukai album ini');
      }
      throw error;
    }

    // HAPUS CACHE (biar data baru ke-load nanti)
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like gagal dihapus. Anda belum menyukai album ini');
    }

    // HAPUS CACHE
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      // 1. Coba ambil dari Redis
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: JSON.parse(result),
        isCache: true, // Penanda buat header X-Data-Source
      };
    } catch (error) {
      // 2. Kalo gagal/gak ada, ambil dari DB
      
      // Cek album ada gak
      await this.getAlbumById(albumId);

      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      
      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].count, 10);

      // 3. Simpen ke Redis (30 menit)
      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(likes));

      return {
        likes,
        isCache: false,
      };
    }
  }
}

export default AlbumsService;