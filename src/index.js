import Starter from './app/starter'
import config from './config'

Starter.start({
  ...config,
  endpoints: {
    middlewares: [],
    middlewaresBeforeJWT: [],
    middlewaresAfterJWT: []
  }
})
