// src/api/albums/handler.js
class AlbumsHandler {
  constructor(service, songsService, storageService, validator, uploadsValidator) {
    this._service = service;
    this._songsService = songsService;
    this._storageService = storageService; 
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUploadCoverHandler(request, h) {
    // 1. Ambil 'cover' dari payload. 'cover' itu adalah stream filenya.
    const { cover } = request.payload;
    const { id: albumId } = request.params;

    // 2. Ambil metadata (headers & filename) dari stream 'cover'
    const { headers, filename: metaFilename } = cover.hapi;

    // 3. Validasi headernya
    this._uploadsValidator.validateImageHeaders(headers);

    // 4. Simpen filenya (kirim stream 'cover' & metadata-nya)
    const filename = await this._storageService.writeFile(cover, { filename: metaFilename });

    // 5. Bikin URL (pastiin path-nya /albums/covers/, sesuai server.js)
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;

    // 6. Update database
    await this._service.addAlbumCoverById(albumId, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

export default AlbumsHandler;