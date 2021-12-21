import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/UserModel'

const adminRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userModel = new UserModel(fastify.db)
  fastify.put('/api/admin/users/:id/inactive/:inactive', {
    preValidation: [fastify.authenticate],
    preHandler: [fastify.guard.role(['admin'])],
  },
  async function (request, reply) {
    const params: any = request.params
    const rss = await userModel.update(params.id, { inactive: 1 })
    return reply.send(rss)
  })

  fastify.post('/api/admin/users/:id/roles', {
    preValidation: [fastify.authenticate],
    preHandler: [fastify.guard.role(['admin'])],
  },
  async function (request, reply) {
    const userRoles: any = request.body
    await userModel.insertUserRoles(userRoles)
    reply.send()
  })
}

export default adminRoute
