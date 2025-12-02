// src/validators/collaborations/schema.js
import Joi from 'joi';

const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

export { CollaborationPayloadSchema };