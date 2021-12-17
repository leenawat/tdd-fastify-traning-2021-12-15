import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/UserModel'
import bcrypt from 'bcryptjs'

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userModel = new UserModel(fastify.db)

  fastify.post('/api/users', async function (request, reply) {
    const data: any = request.body
    data.password = await bcrypt.hashSync(data.password)
    data.inactive = 1
    try {
      const user = await userModel.findByUsername(data.username)
      if (user) {
        return {
          path: request.url,
          timestamp: new Date(),
          message: 'username in use',
        }
      }
      await userModel.save(data)
    } catch (err) {
      fastify.log.error(err)
      return {
        path: request.url,
        timestamp: new Date(),
        err,
      }
    }
    reply.code(201)
    return { message: 'User created' }
  })
}

export default user
