const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(exportsService, playlistService, validator) {
    this._exportsService = exportsService;
    this._playlistService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistByIdHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // Verify if playlist exists and owned by the user
    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      userId: credentialId,
      targetEmail: request.payload.targetEmail,
    };

    await this._exportsService.sendMessage(
      "export:playlists",
      JSON.stringify(message),
    );

    const response = h.response({
      status: "success",
      message: "Permintaan Anda sedang kami proses",
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
