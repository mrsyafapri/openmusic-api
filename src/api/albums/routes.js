const path = require("path");

const routes = (handler) => [
  {
    method: "POST",
    path: "/albums",
    handler: (request, h) => handler.postAlbumHandler(request, h),
  },
  {
    method: "GET",
    path: "/albums",
    handler: (request, h) => handler.getAlbumsHandler(request, h),
  },
  {
    method: "GET",
    path: "/albums/{id}",
    handler: (request, h) => handler.getAlbumByIdHandler(request, h),
  },
  {
    method: "PUT",
    path: "/albums/{id}",
    handler: (request, h) => handler.putAlbumByIdHandler(request, h),
  },
  {
    method: "DELETE",
    path: "/albums/{id}",
    handler: (request, h) => handler.deleteAlbumByIdHandler(request, h),
  },
  {
    method: "POST",
    path: "/albums/{id}/covers",
    handler: (request, h) => handler.postUploadImageHandler(request, h),
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000,
        uploads: path.resolve(__dirname, "file", "images"),
      },
    },
  },
  {
    method: "GET",
    path: "/albums/{param*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "file"),
      },
    },
  },
  {
    method: "POST",
    path: "/albums/{id}/likes",
    handler: (request, h) => handler.postLikeAlbumHandler(request, h),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/albums/{id}/likes",
    handler: (request, h) => handler.deleteLikeAlbumHandler(request, h),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
  {
    method: "GET",
    path: "/albums/{id}/likes",
    handler: (request, h) => handler.getAlbumLikeCountHandler(request, h),
  },
];

module.exports = routes;
