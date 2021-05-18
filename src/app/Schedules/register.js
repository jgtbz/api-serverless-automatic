import Database from '../Database'
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
    // const id = context.awsRequestId
    await bootstrap(state)
    await handler(event, context)
  }
}

export default register
