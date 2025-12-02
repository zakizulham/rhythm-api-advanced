// src/validators/songs/schema.js
import Joi from 'joi';

// Skema ini buat validasi data lagu
const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer(), // Ini opsional, ga pake .required()
  albumId: Joi.string(), // Ini juga opsional
});

export { SongPayloadSchema };