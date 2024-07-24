const Joi = require('joi');

const AuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const RefreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  AuthenticationPayloadSchema,
  RefreshTokenPayloadSchema,
};
