// src/validators/songs/index.js
import InvariantError from '../../exceptions/InvariantError.js';
import { SongPayloadSchema } from './schema.js';

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    
    // Kalo datanya ga lolos skema, lempar error 400
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default SongsValidator;