// src/api/likes/handler.js
class AlbumLikesHandler {
  constructor(albumsService) {
    this._albumsService = albumsService;
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.addAlbumLike(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    });
    response.code(201);
    return response;
  }
  
  async deleteAlbumLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.deleteAlbumLike(albumId, credentialId);

    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { count, isCache } = await this._albumsService.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: count,
      },
    });
    
    // Kriteria 4: Kalo dari cache, kasih header X-Data-Source
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    
    response.code(200);
    return response;
  }
}

export default AlbumLikesHandler;