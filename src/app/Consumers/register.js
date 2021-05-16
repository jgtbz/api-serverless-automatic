import { getContext } from '../utils'

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

  return handler
}

export default register
