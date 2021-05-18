import send from './send'
import decodeMessage from './decodeMessage'

export default (state) => ({
  send: send(state),
  decodeMessage
})
