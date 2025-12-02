// src/validators/albums/schema.js
import Joi from 'joi';

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
});

export { AlbumPayloadSchema };