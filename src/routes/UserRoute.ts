import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/UserModel'
import bcrypt from 'bcryptjs'

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userModel = new UserModel(fastify.db)

  fastify.post('/api/users', async function (request, reply) {
    const data: any = request.body
    data.password = await bcrypt.hashSync(data.password)
    await userModel.save(data)
    reply.code(201)
    return { message: 'User created' }
  })
}

export default user
