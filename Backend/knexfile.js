import 'dotenv/config'

const development = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'shipmenttracking',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
  }
};

export default {
  development
};