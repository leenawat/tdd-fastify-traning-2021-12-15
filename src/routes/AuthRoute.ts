import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/UserModel'
import bcrypt from 'bcryptjs'

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userModel = new UserModel(fastify.db)

  fastify.post('/api/auth', async function (request, reply) {
    const body:any = request.body
    const { username, password } = body
    const user:any = await userModel.findByUsername(username)

    if (!user) {
      reply.code(401)
      return {
        status: 401,
        message: 'authentication_failure',
      }
    }
    const match = await bcrypt.compareSync(password, user.password)
    if (!match) {
      reply.code(401)
      return {
        status: 401,
        message: 'authentication_failure',
      }
    }

    reply.send()
  })
}
export default auth
