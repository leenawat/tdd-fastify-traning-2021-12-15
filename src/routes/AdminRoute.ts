import { FastifyPluginAsync } from 'fastify'

const adminRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.put('/api/admin/users/:id/inactive/:inactive', {
    preValidation: [fastify.authenticate],
    preHandler: [fastify.guard.role(['admin'])],
  },
  async function (request, reply) {
    return reply.send()
  })
}

export default adminRoute
