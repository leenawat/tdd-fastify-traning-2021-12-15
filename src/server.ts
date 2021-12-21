import fastify from 'fastify'
import fp from 'fastify-plugin'
import App from './app'
const config = require('config')

const { serverPort: port, myEnv } = config

const start = async () => {
  // eslint-disable-next-line no-console
  console.log({ port, myEnv })
  try {
    const app = fastify({
      logger: {
        level: 'info',
      },
      ajv: {
        customOptions: {
          allErrors: true,
        },
      },
      disableRequestLogging: true,
    })
    app.register(fp(App))
    await app.listen(port)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
    process.exit(0)
  }
}

start()
