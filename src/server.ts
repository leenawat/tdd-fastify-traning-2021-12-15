import fastify from 'fastify'
import fp from 'fastify-plugin'
import App from './app'
import config from 'config'

const port: any = config.get('server-port')
const myEnv: any = config.get('my-env')

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
