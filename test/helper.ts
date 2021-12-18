import fastify from 'fastify'
import fp from 'fastify-plugin'
import App from '../src/app'
export function build() {
  const opts = {
    ajv: {
      customOptions: {
        jsonPointers: true,
        allErrors: true,
      },
      plugins: [
        require('ajv-errors'),
      ],
    },
  }
  const app = fastify(opts)
  beforeAll(async () => {
    void app.register(fp(App))
    await app.ready()
  })
  afterAll(() => app.close())
  return app
}
