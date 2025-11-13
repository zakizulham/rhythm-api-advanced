// src/validators/users/schema.js
import Joi from 'joi';

// username, password, fullname wajib ada
const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

export { UserPayloadSchema };