import knex from 'knex'

const config = require('config')

const { database: dbConfig } = config
export default knex({
  client: dbConfig.client,
  connection: {
    port: dbConfig.port,
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  },
})
