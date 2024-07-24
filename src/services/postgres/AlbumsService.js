const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils/albums');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
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

    // Invalidate cache after adding an album
    await this._cacheService.delete('albums');

    return result.rows[0].id;
  }

  async getAlbums() {
    const cacheKey = 'albums';

    try {
      const cachedAlbums = await this._cacheService.get(cacheKey);
      return {
        albums: JSON.parse(cachedAlbums),
        source: 'cache'
      };
    } catch (error) {
      const result = await this._pool.query('SELECT * FROM albums');
      const albums = result.rows.map(mapDBToModel);

      // Cache the result for 30 minutes
      await this._cacheService.set(cacheKey, JSON.stringify(albums), 1800);

      return {
        albums,
        source: 'database'
      };
    }
  }

  async getAlbumById(id) {
    const cacheKey = `album_${id}`;

    try {
      const cachedAlbum = await this._cacheService.get(cacheKey);
      return {
        album: JSON.parse(cachedAlbum),
        source: 'cache'
      };
    } catch (error) {
      const albumQuery = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id],
      };
      const albumResult = await this._pool.query(albumQuery);

      if (!albumResult.rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      const album = mapDBToModel(albumResult.rows[0]);

      const songsQuery = {
        text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
        values: [id],
      };
      const songsResult = await this._pool.query(songsQuery);

      album.songs = songsResult.rows;

      // Cache the result for 30 minutes
      await this._cacheService.set(cacheKey, JSON.stringify(album), 1800);

      return {
        album,
        source: 'database'
      };
    }
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    // Invalidate cache after updating an album
    await this._cacheService.delete(`album_${id}`);
    await this._cacheService.delete('albums');
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

    // Invalidate cache after deleting an album
    await this._cacheService.delete(`album_${id}`);
    await this._cacheService.delete('albums');
  }

  async updateAlbumCoverUrl(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal memperbarui cover album. Id tidak ditemukan',
      );
    }

    // Invalidate cache after updating cover URL
    await this._cacheService.delete(`album_${id}`);
  }

  async likeAlbum(userId, albumId) {
    await this.verifyAlbumExists(albumId);

    const id = `like_album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3) ON CONFLICT (user_id, album_id) DO NOTHING',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      // Conflict occurred: User has already liked the album
      throw new InvariantError('User sudah menyukai album ini');
    }

    // Invalidate the cache for this album
    await this._cacheService.delete(`album_like_count_${albumId}`);
    await this._cacheService.delete(`album_${albumId}`);
  }

  async unlikeAlbum(userId, albumId) {
    await this.verifyAlbumExists(albumId);

    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    await this._pool.query(query);

    // Invalidate the cache for this album
    await this._cacheService.delete(`album_like_count_${albumId}`);
    await this._cacheService.delete(`album_${albumId}`);
  }

  async getAlbumLikeCount(albumId) {
    const cacheKey = `album_like_count_${albumId}`;

    try {
      const cachedLikes = await this._cacheService.get(cacheKey);
      return {
        count: parseInt(cachedLikes, 10),
        source: 'cache'
      };
    } catch (error) {
      const result = await this._pool.query(
        'SELECT COUNT(*) AS count FROM user_album_likes WHERE album_id = $1',
        [albumId]
      );

      const count = parseInt(result.rows[0].count, 10);

      // Cache the result for 30 minutes
      await this._cacheService.set(cacheKey, count.toString(), 1800);

      return {
        count,
        source: 'database'
      };
    }
  }

  async verifyAlbumExists(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
