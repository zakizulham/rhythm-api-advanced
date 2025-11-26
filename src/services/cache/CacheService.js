// src/services/cache/CacheService.js
import redis from 'redis';
import config from '../../utils/config.js';

class CacheService {
  constructor() {
    // Bikin koneksi ke Redis
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    // Connect manual di v4
    this._client.connect();
  }

  // Fungsi buat nyimpen data ke cache
  async set(key, value, expirationInSecond = 1800) { // 1800 detik = 30 menit
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  // Fungsi buat ngambil data dari cache
  async get(key) {
    const result = await this._client.get(key);
    if (result === null) throw new Error('Cache tidak ditemukan'); // Biar ditangkep 'catch'
    return result;
  }

  // Fungsi buat ngehapus data dari cache
  async delete(key) {
    return this._client.del(key);
  }
}

export default CacheService;