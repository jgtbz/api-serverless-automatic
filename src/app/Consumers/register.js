import Database from '../Database'
import { getContext } from '../utils'

let app

const bootstrap = async (state) => {
  if (!app) {
    app = await Database.connect(state.config.database)
  }
}

const register = (state) => ({ topic, queue, concurrency = 1, batchSize = 1, timeout = 900, fifo = false, handler }) => {
  const { module, path } = getContext()

  const moduleTopic = `${module}-${topic}`
  const moduleQueue = `${module}-${queue}`

  state.addTopic({
    name: moduleTopic
  })

  state.addQueue({
    topic: moduleTopic,
    name: moduleQueue,
    path,
    options: {
      concurrency,
      batchSize,
      timeout,
      fifo
    }
  })

  return async (event, context) => {
    // const id = context.awsRequestId
    await bootstrap(state)
    await handler(event, context)
  }
}

export default register
