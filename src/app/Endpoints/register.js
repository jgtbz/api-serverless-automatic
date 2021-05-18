import Database from '../Database'
import Loggers from '../Loggers'
import Middlewares from './Middlewares'
import { getContext, pipeAsync } from '../utils'

let app

const bootstrap = async (state) => {
  if (!app) {
    app = await Database.connect(state.config.database)
  }
}

const register = (state) => ({ path, method, middlewares, isPublic }) => {
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

      const { queryStringParameters, pathParameters, body, headers } = event

      const request = {
        headers,
        query: queryStringParameters ?? {},
        params: pathParameters ?? {},
        body: body ? JSON.parse(body) : {}
      }

      const options = {
        isPublic
      }

      const execute = pipeAsync(
        Middlewares.decode(state, options),
        ...state.config.endpoints.middlewares,
        ...state.config.endpoints.middlewaresBeforeJWT,
        Loggers.start(id),
        Middlewares.jwt(state, options),
        ...state.config.endpoints.middlewaresAfterJWT,
        Middlewares.paginate(state, options),
        Middlewares.sort(state, options),
        Middlewares.query(state, options),
        ...middlewares,
        Loggers.success(id)
      )
  
      const result = await execute(request)
  
      const response = {
        statusCode: 200,
        body: JSON.stringify(result)
      }
      return response
    } catch (error) {
      await Loggers.error(id)(error)
      const response = {
        statusCode: error.status ?? 500,
        body: JSON.stringify(error)
      }
      return response
    }
  }
}

export default register
