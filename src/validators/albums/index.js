// src/validators/albums/index.js
import InvariantError from '../../exceptions/InvariantError.js';
import { AlbumPayloadSchema } from './schema.js';

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      // Kalo validasi gagal, lempar error 400
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default AlbumsValidator;