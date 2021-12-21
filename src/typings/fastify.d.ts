/* eslint-disable no-unused-vars */
import { FastifyInstance } from 'fastify'
import { Knex } from 'knex'

declare module 'fastify' {
    interface FastifyInstance {
        db: Knex;
        authenticate: any;
        guard: any;
    }

    interface FastifyRequest {
        jwtVerify: any;
        user: any;
    }
}
