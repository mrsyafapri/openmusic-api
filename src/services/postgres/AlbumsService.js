const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBToModel } = require("../../utils/albums");

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query("SELECT * FROM albums");
    return result.rows.map(mapDBToModel);
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rowCount) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    const album = mapDBToModel(albumResult.rows[0]);

    const songsQuery = {
      text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    album.songs = songsResult.rows;
    return album;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui catatan. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }

  async updateAlbumCoverUrl(id, coverUrl) {
    const query = {
      text: "UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id",
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        "Gagal memperbarui cover album. Id tidak ditemukan",
      );
    }
  }

  async likeAlbum(userId, albumId) {
    await this.verifyAlbumExists(albumId);

    const id = `like_album-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3) ON CONFLICT (user_id, album_id) DO NOTHING",
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      // Conflict occurred: User has already liked the album
      throw new InvariantError("User sudah menyukai album ini");
    }

    // Invalidate cache as user liked the album successfully
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async unlikeAlbum(userId, albumId) {
    await this.verifyAlbumExists(albumId);

    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    await this._pool.query(query);

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikeCount(albumId) {
    // Check if the count is cached
    const cachedCount = await this._cacheService.get(`album-likes:${albumId}`);

    if (cachedCount) {
      return { count: parseInt(cachedCount, 10), dataSource: "cache" };
    }

    // If not cached, fetch from database
    const result = await this._pool.query(
      "SELECT COUNT(*) AS count FROM user_album_likes WHERE album_id = $1",
      [albumId],
    );

    const count = parseInt(result.rows[0].count, 10);

    // Cache the result
    await this._cacheService.set(`album-likes:${albumId}`, count, 30 * 60); // Cache for 30 minutes

    return { count, dataSource: "database" };
  }

  async verifyAlbumExists(albumId) {
    const query = {
      text: "SELECT id FROM albums WHERE id = $1",
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("Album tidak ditemukan");
    }
  }
}

module.exports = AlbumsService;
