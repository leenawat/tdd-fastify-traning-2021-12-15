import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply } from 'fastify'
import FastifyJwt from 'fastify-jwt'
import config from 'config'

const jwtConfig: any = config.get('jwt')

export default fp(async (fastify: any, opts: any) => {
  fastify.register(FastifyJwt, {
    secret: jwtConfig.secret,
  })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})
