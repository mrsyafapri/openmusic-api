const {
  AuthenticationPayloadSchema,
  RefreshTokenPayloadSchema,
} = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const AuthenticationsValidator = {
  validateAuthenticationPayload: (payload) => {
    const validationResult = AuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateRefreshTokenPayload: (payload) => {
    const validationResult = RefreshTokenPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;
