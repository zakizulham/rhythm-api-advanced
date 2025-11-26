// src/services/postgres/AlbumsService.js
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import pool from './Pool.js';

class AlbumsService {
  // UPDATE CONSTRUCTOR: Terima cacheService
  constructor(cacheService) {
    this._pool = pool;
    this._cacheService = cacheService;
  }

  // --- FITUR V2 ---
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
      // Update query buat ambil coverUrl juga (buat persiapan V3)
      text: 'SELECT id, name, year, "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songsResult = await this._pool.query(songsQuery);

    return { ...result.rows[0], songs: songsResult.rows };
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

  async addAlbumCoverById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui cover. Album tidak ditemukan');
    }
  }

  // --- FITUR LIKES V3 ---

  async addAlbumLike(albumId, userId) {
    await this.getAlbumById(albumId); // Cek album ada

    const id = `like-${nanoid(16)}`;
    const query = {
      // Pake user_id dan album_id (snake_case sesuai migrasi)
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0].id) {
        throw new InvariantError('Gagal menyukai album');
      }
      // Hapus cache
      try {
        await this._cacheService.delete(`likes:${albumId}`);
      } catch (error) {
        console.error(`Gagal menghapus cache untuk album ${albumId}:`, error.message);
      }
    } catch (error) {
      if (error.constraint === 'unique_user_album_likes') {
        throw new InvariantError('Anda sudah menyukai album ini');
      }
      throw error;
    }
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal membatalkan like. Anda belum menyukai album ini');
    }

    // Hapus cache
    try {
      await this._cacheService.delete(`likes:${albumId}`);
    } catch (error) {
      console.error(`Gagal menghapus cache untuk album ${albumId}:`, error.message);
    }
  }

  async getAlbumLikes(albumId) {
    try {
      // 1. Cek Cache
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: JSON.parse(result),
        isCache: true,
      };
    } catch (_error) {
      // 2. Ambil DB
      await this.getAlbumById(albumId); // Cek album ada

      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].count, 10);

      // 3. Simpan Cache
      try {
        await this._cacheService.set(`likes:${albumId}`, JSON.stringify(likes));
      } catch (error) {
        console.error(`Gagal menyimpan cache untuk album ${albumId}:`, error.message);
      }

      return {
        likes,
        isCache: false,
      };
    }
  }
}

export default AlbumsService;