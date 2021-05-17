import Endpoints from './Endpoints'
import Consumers from './Consumers'
import Schedules from './Schedules'
import AWS from './AWS'
import state from './state'

export default {
  Endpoints: Endpoints(state),
  Consumers: Consumers(state),
  Schedules: Schedules(state),
  AWS: AWS(state)
}
