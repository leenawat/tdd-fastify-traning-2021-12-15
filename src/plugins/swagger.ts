/* eslint-disable @typescript-eslint/no-var-requires */
import fp from 'fastify-plugin'
import FastifySwagger from 'fastify-swagger'

export default fp(async (fastify: any, opts: any, done: any) => {
  fastify.register(FastifySwagger, {
    routePrefix: '/swagger',
    openapi: {
      info: {
        title: 'Test swagger',
        description: 'Testing the Fastify swagger API',
        version: '0.1.0',
      },
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'auth', description: 'Auth related end-points' },
        { name: 'user', description: 'User related end-points' },
      ],
      components: {
        securitySchemes: {
          bearer: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    exposeRoute: true,
  })
  done()
})
