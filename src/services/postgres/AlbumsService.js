// src/services/postgres/AlbumsService.js
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import ClientError from '../../exceptions/ClientError.js';
import pool from './Pool.js';

class AlbumsService {
  
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
    // 1. Ambil data albumnya dulu
    const albumQuery = {
      text: 'SELECT id, name, year, "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    // 2. Ambil semua lagu yang ada di album itu
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    // 3. Gabungin datanya jadi satu objek
    const album = albumResult.rows[0];
    album.songs = songsResult.rows;

    return album;
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

  async addCoverAlbumById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
    }
  }

  async verifyAlbumLike(albumId, userId) {

    // Method untuk cek udah pernah like album apa belum
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new ClientError('Anda sudah menyukai album ini');
    }
  }

  async addAlbumLike(albumId, userId) {
  // Nambah data like ke tabel user_album_likes
    
    // cek albumnya ada atau nggak
    await this.getAlbumById(albumId);

    // cek biar gak like dua kali
    try {
      await this.verifyAlbumLike(albumId, userId);
    }

    catch (error) {
      if (error instanceof ClientError) {
        throw error;
      }

      // jika error clientError (400 dari verifyAlbumLike) berarti beneran udah like
      throw new InvariantError('Gagal menambah like. Anda sudah menyukai album ini.');
    }

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    // 2. HAPUS cache kalo berhasil nambah like
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async deleteAlbumLike(albumId, userId) {
    // Hapus like
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan');
    }

    // HAPUS cache kalo berhasil hapus like
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    // Coba ambil dari cache Redis dulu
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      return {
        count: parseInt(result, 10),
        isCache: true,
      };
    } catch (error) {

      // kalo di cache gak ada, ambil dari database

      // Cek albumnya ada atau nggak
      await this.getAlbumById(albumId);

      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likeCount = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`album-likes:${albumId}`, likesCount, 1800);
      return { count: likeCount, isCache: false };
    }
  }

  async addAlbumCoverById(id, coverUrl) {
    const query = {
      // pake "coverUrl" karena kita pake camelcase di migrasi
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui sampul. Album tidak ditemukan');
    }
  }
}

export default AlbumsService;