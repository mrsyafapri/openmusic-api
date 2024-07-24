const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  memcached: {
    host: process.env.MEMCACHED_SERVER,
  },
};

module.exports = config;
