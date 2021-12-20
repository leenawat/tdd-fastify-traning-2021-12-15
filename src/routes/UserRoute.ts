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

  fastify.get('/api/users', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            default: 0,
            minimum: 0,
            errorMessage: {
              minimum: 'ต้องมีค่ามากกว่า หรือเท่ากับ 0',
            },
          },
          size: {
            type: 'number',
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
      },
    },
    preValidation: [fastify.authenticate],
  }, async function (request, reply) {
    const query: any = request.query
    const { page, size } = query
    const userPage = await userModel.find(page, size)
    reply.code(200)
    return userPage
  })

  fastify.get('/api/users/:id', async (request, reply) => {
    const params: any = request.params
    const user = await userModel.findById(params.id)
    if (!user) {
      reply.code(204).send()
    } else {
      reply.code(200).send(user)
    }
  })

  fastify.put('/api/users/:id', {
    schema: {
      params: {
        type: 'object',
        require: ['id'],
        properties: {
          id: { type: 'number' },
        },
      },
    },
    preValidation: [fastify.authenticate],
  }, async (request, reply) => {
    const params:any = request.params
    const user:any = request.user
    if (!user || user.uid !== params.id) {
      return reply.code(403).send()
    }
    reply.code(200).send()
  })
}

export default user
