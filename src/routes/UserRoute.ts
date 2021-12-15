import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/UserModel'

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userModel = new UserModel(fastify.db)

  fastify.post('/api/users', async function (request, reply) {
    await userModel.save(request.body)
    reply.code(201)
    return { message: 'User created' }
  })
}

export default user
