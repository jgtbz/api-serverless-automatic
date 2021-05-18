import Database from '../Database'
import { getContext } from '../utils'

let app

const bootstrap = async (state) => {
  if (!app) {
    app = await Database.connect(state.config.database)
  }
}

const register = (state) => ({ path, method, isPublic, middlewares }) => {
  const { module, file, path: contextPath } = getContext()

  const moduleEndpoint = `${module}-${file}`

  state.addEndpoint({
    name: moduleEndpoint,
    path: contextPath,
    options: {
      path,
      method
    }
  })

  return async (event, context) => {
    const id = context.awsRequestId
    try {
      await bootstrap(state)

      const { body, headers } = event
      const { module, action, version = 'v1', payload } = JSON.parse(body)
  
      if (!middlewares) {
        throw { status: 404, message: 'Not Found' }
      }
  
      const execute = Utils.pipeAsync(
        // Middlewares.decode,
        // Loggers.before(id),
        // Middlewares.jwt({ isPublic }),
        // Middlewares.tenant,
        // Middlewares.paginate,
        // Middlewares.sort,
        // Middlewares.query,
        ...middlewares,
        // Loggers.after(id)
      )
  
      const result = await execute({ headers, module, action, version, ...payload })
  
      const response = {
        statusCode: 200,
        body: JSON.stringify(result)
      }
  
      return response
    } catch (error) {
      console.log(error)
      // await Loggers.after(id)(error)
      const response = !error.status
        ? { statusCode: 500, body: JSON.stringify(error) }
        : { statusCode: error.status, body: JSON.stringify(error) }
      return response
    }
  }
}

export default register
