const autoBind = require('auto-bind');
const config = require('../../utils/config');

class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });

    return h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    }).code(201);
  }

  async getAlbumsHandler() {
    const { albums, source } = await this._albumsService.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
      source,
    };
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { album, source } = await this._albumsService.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
      source,
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUploadImageHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${config.app.host}:${config.app.port}/albums/images/${filename}`;

    await this._albumsService.updateAlbumCoverUrl(albumId, coverUrl);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }

  async postLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.likeAlbum(userId, albumId);

    return h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    }).code(201);
  }

  async deleteLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.unlikeAlbum(userId, albumId);

    return h.response({
      status: 'success',
      message: 'Berhasil batal menyukai album',
    }).code(200);
  }

  async getAlbumLikeCountHandler(request, h) {
    const { id: albumId } = request.params;

    const { count, source } = await this._albumsService.getAlbumLikeCount(albumId);

    return h.response({
      status: 'success',
      data: {
        likes: count,
      },
    }).header('X-Data-Source', source).code(200);
  }
}

module.exports = AlbumsHandler;
