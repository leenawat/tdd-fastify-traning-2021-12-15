import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply } from 'fastify'
import FastifyJwt from 'fastify-jwt'

const config = require('config')
const { jwt: jwtConfig } = config

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
    } catch (err:any) {
      if (err.code === 'FAST_JWT_MALFORMED') {
        reply.code(403).send({
          statusCode: 403,
          code: 'FAST_JWT_MALFORMED',
          message: 'The token header is not a valid base64url serialized JSON.',
        })
      } else {
        reply.send(err)
      }
    }
  })
})
