const Memcached = require('memcached');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = new Memcached(config.memcached.host || 'localhost:11211');
  }

  async set(key, value, expirationInSeconds = 1800) {
    // Default to 30 minutes
    return new Promise((resolve, reject) => {
      this._client.set(key, value, expirationInSeconds, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this._client.get(key, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  async delete(key) {
    return new Promise((resolve, reject) => {
      this._client.del(key, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

module.exports = CacheService;
