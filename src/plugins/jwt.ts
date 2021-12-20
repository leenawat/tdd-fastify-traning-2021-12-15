import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply } from 'fastify'
import FastifyJwt from 'fastify-jwt'
import config from 'config'

const jwtConfig: any = config.get('jwt')

export default fp(async (fastify: any, opts: any) => {
  // https://github.com/fastify/fastify-jwt#example-2
  const myCustomMessages = {
    noAuthorizationInHeaderMessage: 'Autorization header is missing!',
    authorizationTokenInvalid: (err) => {
      return `Authorization token is invalid: ${err.message}`
    },
  }

  fastify.register(FastifyJwt, {
    secret: jwtConfig.secret,
    messages: myCustomMessages,
  })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})
