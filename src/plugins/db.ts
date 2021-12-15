import fp from 'fastify-plugin'
import db from '../config/database'

export default fp(async (fastify:any, opts:any, done:any) => {
  fastify.decorate('db', await db)

  fastify.db.raw('SELECT 1')
    .then(() => {
      fastify.log.info('MySQL connect success')
    })
    .catch(function(error) {
      fastify.log.error('MySQL connect fail!!!')
      fastify.log.error(error)
    })
  done()
})
