import LoggersModel from './model'

const before = () => (id) => async (req) => {
  await LoggersModel({ id, request: JSON.stringify(req) }).save()
  return req
}

const after = () => (id) => async (req) => {
  await LoggersModel.findOneAndUpdate({ id }, { response: JSON.stringify(req) })
  return req
}

export default {
  after,
  before
}
