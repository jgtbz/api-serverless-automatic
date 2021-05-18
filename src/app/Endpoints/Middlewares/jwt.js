import jsonWebToken from 'jsonwebtoken'

export default (state, { isPublic }) => (req) => {
  if (!state.config.server.secret) {
    return req
  }

  if (isPublic) {
    return req
  }

  try {
    jsonWebToken.verify(req.token, config.server.secret)
    return req
  } catch (err) {
    throw { status: 401, message: 'Unauthorized' }
  }
}
