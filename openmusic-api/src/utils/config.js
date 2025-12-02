// src/utils/config.js
import 'dotenv/config';

const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  db: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
  },
  jwt: {
    access: process.env.ACCESS_TOKEN_KEY,
    refresh: process.env.REFRESH_TOKEN_KEY,
  },
  rabbitMQ: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

export default config;