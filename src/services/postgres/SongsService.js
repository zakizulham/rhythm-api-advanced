// src/services/postgres/SongsService.js
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import pool from './Pool.js';

class SongsService {
  constructor() {
    this._pool = pool;
  }

  // Nyimpen lagu baru ke db
  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    
    // Perhatiin, nama kolom di db itu "album_id" (snake_case)
    const query = {
      text: 'INSERT INTO songs(id, title, year, genre, performer, duration, album_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  // Ngambil semua lagu (plus filter buat Kriteria Opsional 2)
  async getSongs(title, performer) {
    let queryText = 'SELECT id, title, performer FROM songs';
    const queryValues = [];

    // Cek kalo ada query ?title
    if (title) {
      queryValues.push(`%${title}%`);
      queryText += ` WHERE title ILIKE $${queryValues.length}`;
    }

    // Cek kalo ada query ?performer
    if (performer) {
      queryValues.push(`%${performer}%`);
      queryText += title ? ' AND' : ' WHERE'; // Kalo title ada, pake AND, kalo ga, pake WHERE
      queryText += ` performer ILIKE $${queryValues.length}`;
    }
    
    const query = { text: queryText, values: queryValues };
    const result = await this._pool.query(query);
    return result.rows;
  }

  // Ngambil satu lagu aja pake ID
  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    return result.rows[0];
  }

  // Ngubah data lagu di db
  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  // Ngehapus lagu dari db
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

export default SongsService;