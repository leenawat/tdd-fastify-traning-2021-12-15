import knex from 'knex'
import config from 'config'

const dbConfig: any = config.get('database')
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
