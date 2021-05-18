import Database from '../Database'
import Loggers from '../Loggers'
import AWS from '../AWS'
import { getContext } from '../utils'

let app

const bootstrap = async (state) => {
  if (!app) {
    app = await Database.connect(state.config.database)
  }
}

const register = (state) => ({ rate, timeout = 900, handler }) => {
  const { module, file, path } = getContext()

  const moduleSchedule = `${module}-${file}`

  state.addSchedule({
    name: moduleSchedule,
    path,
    options: {
      rate,
      timeout
    }
  })

  return async (event, context) => {
    const id = context.awsRequestId
    const message = AWS.SNS.decodeMessage(event)
    try {
      await bootstrap(state)
      await Loggers.start(id)(message)
      const response = await handler(message)
      await Loggers.success(id)(response)
    } catch (error) {
      await Loggers.error(id)(error)
    }
  }
}

export default register
