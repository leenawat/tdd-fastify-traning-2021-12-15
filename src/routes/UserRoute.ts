import { FastifyPluginAsync } from 'fastify'

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post('/api/users', async function (request, reply) {
    reply.code(201).send()
  })
}

export default user
