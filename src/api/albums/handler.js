// src/api/albums/handler.js
import InvariantError from '../../exceptions/InvariantError.js';

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
    const { cover } = request.payload;
    if (!cover) {
      throw new InvariantError('Cover is required');
    }

    const { hapi } = cover;
    if (!hapi) {
      throw new InvariantError('Cover must be a file');
    }

    const { headers, filename: metaFilename } = hapi;

    this._uploadsValidator.validateImageHeaders(headers);

    const filename = await this._storageService.writeFile(cover, { filename: metaFilename });

    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;

    const { id: albumId } = request.params;
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