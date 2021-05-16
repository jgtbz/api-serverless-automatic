import { getContext } from '../utils'

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

  return handler
}

export default register
