// src/plugins/guard.ts
/* eslint-disable @typescript-eslint/no-var-requires */
import fp from 'fastify-plugin'

export default fp(async (fastify: any, opts: any, done: any) => {
  fastify.register(require('fastify-guard'), {
    roleProperty: 'roles',
  })
  done()
})
