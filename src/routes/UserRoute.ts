import { FastifyPluginAsync } from 'fastify'
import UserModel from '../models/UserModel'
import bcrypt from 'bcryptjs'
import FileService from '../FileService'

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const userModel = new UserModel(fastify.db)

  fastify.post('/api/users', {
    schema: {
      tags: ['user'],
      body: {
        type: 'object',
        require: ['username', 'password', 'prename', 'fname', 'lname'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
          prename: { type: 'string' },
          fname: { type: 'string' },
          lname: { type: 'string' },
        },
      },
    },
  }, async function (request, reply) {
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
      security: [{ bearer: [] }],
      tags: ['user'],
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

  fastify.get('/api/users/:id', {
    schema: {
      security: [{ bearer: [] }],
      tags: ['user'],
    },
  }, async (request, reply) => {
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
      security: [{ bearer: [] }],
      tags: ['user'],
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
    const updatedBody:any = request.body
    if (!user || user.uid !== params.id) {
      return reply.code(403).send()
    }
    if (updatedBody.image) {
      const buffer = Buffer.from(updatedBody.image, 'base64')
      if (!FileService.isLessThan2MB(buffer)) {
        reply.code(413).send({
          statusCode: 413,
          code: 'FST_ERR_CTP_BODY_TOO_LARGE',
          error: 'Payload Too Large',
          message: 'image is too large, image should <= 2MB',
        })
      }

      const supportedType = await FileService.isSupportedFileType(buffer)
      if (!supportedType) {
        reply.code(413).send({
          statusCode: 413,
          error: 'UNSUPPORTED_IMAGE_FILE_TYPE',
          message: 'Only JPEG or PNG files are allowed',
        })
      }

      updatedBody.image = await FileService.saveProfileImage(updatedBody.image)
    }

    if (Object.keys(updatedBody).includes('uid') ||
    Object.keys(updatedBody).includes('username') ||
    Object.keys(updatedBody).includes('inactive')) {
      reply.code(403).send({
        statusCode: 403,
        message: 'ไม่อนุญาตให้แก้ไข id, username หรือ inactive',
      })
    }

    const result = await userModel.update(params.id, updatedBody)
    reply.code(200).send(result)
  })

  fastify.delete('/api/users/:uid',
    {
      schema: {
        security: [{ bearer: [] }],
        tags: ['user'],
      },
      preValidation: [fastify.authenticate],
      preHandler: [fastify.guard.role(['admin'])],
    },
    async (request, reply) => {
      const params:any = request.params
      const result = await userModel.delete(params.uid)
      reply.send(result)
    })
}

export default user
