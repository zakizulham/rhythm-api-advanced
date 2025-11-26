// src/api/likes/handler.js
class LikesHandler {
  constructor(service) {
    this._service = service;
  }

  async postLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.addAlbumLike(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    });
    response.code(201);
    return response;
  }

  async deleteLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteAlbumLike(albumId, credentialId);

    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }

  async getLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, isCache } = await this._service.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    // Kriteria 4: Custom Header
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    response.code(200);
    return response;
  }
}

export default LikesHandler;