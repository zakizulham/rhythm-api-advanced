// src/services/cache/CacheService.js
import redis from 'redis';
import config from '../../utils/config.js';

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        url: config.redis.host,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.connect();
  }

  // Fungsi buat nyimpen data ke cache
  async set(key, value, expirationInSecond = 1800) { // 30 menit
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  // Fungsi buat ngambil data dari cache
  async get(key) {
    const result = await this._client.get(key);
    if (result === null) throw new Error('Cache tidak ditemukan');
    return result;
  }

  // Fungsi buat ngehapus data dari cache
  async delete(key) {
    return this._client.del(key);
  }
}

export default CacheService;