import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/UserModel'
import bcrypt from 'bcryptjs'

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userModel = new UserModel(fastify.db)

  fastify.post('/api/auth', {
    schema: {
      body: {
        type: 'object',
        required: ['username'],
        properties: {
          username: { type: 'string' },
        },
      },
    },
    attachValidation: true,
  }, async function (request, reply) {
    if (request.validationError) {
      // `request.validationError.validation` contains the raw validation error
      reply.code(401).send({
        status: 401,
        message: 'Incorrect credentials',
      })
    }

    const body: any = request.body
    const { username, password } = body
    const user: any = await userModel.findByUsername(username)

    if (!user) {
      reply.code(401)
      return {
        status: 401,
        message: 'Incorrect credentials',
      }
    } else {
      if (user.inactive) {
        reply.code(403)
        return {
          status: 403,
          message: 'Account is inactive',
        }
      }
    }
    const match = await bcrypt.compareSync(password, user.password)
    if (!match) {
      reply.code(401)
      return {
        status: 401,
        message: 'Incorrect credentials',
      }
    }
    const token = await fastify.jwt.sign({ uid: user.uid }, { expiresIn: '10h' })
    reply.send({ uid: user.uid, username: user.username, token })
  })
}
export default auth
