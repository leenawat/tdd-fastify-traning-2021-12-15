import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/UserModel'

const adminRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userModel = new UserModel(fastify.db)
  fastify.put('/api/admin/users/:id/inactive/:inactive', {
    schema: {
      security: [{ bearer: [] }],
      tags: ['admin'],
    },
    preValidation: [fastify.authenticate],
    preHandler: [fastify.guard.role(['admin'])],
  },
  async function (request, reply) {
    const params: any = request.params
    const rss = await userModel.update(params.id, { inactive: 1 })
    return reply.send(rss)
  })

  fastify.post('/api/admin/users/:id/roles', {
    schema: {
      security: [{ bearer: [] }],
      tags: ['admin'],
    },
    preValidation: [fastify.authenticate],
    preHandler: [fastify.guard.role(['admin'])],
  },
  async function (request, reply) {
    const params:any = request.params
    const userId = params.id
    const userRoles: any = request.body
    await userModel.insertUserRoles(userId, userRoles)
    reply.send()
  })

  fastify.delete('/api/admin/users/:id/roles/:roleId', {
    schema: {
      security: [{ bearer: [] }],
      tags: ['admin'],
    },
    preValidation: [fastify.authenticate],
    preHandler: [fastify.guard.role(['admin'])],
  },
  async function (request, reply) {
    const params:any = request.params
    const userId = params.id
    const roleId = params.roleId
    await userModel.deleteUserRoles({ user_id: userId, role_id: roleId })
    reply.send()
  })
}

export default adminRoute
