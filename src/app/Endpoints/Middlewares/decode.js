import jsonWebToken from 'jsonwebtoken'

export default (state) => (req) => {
  if (!state.config.server.secret) {
    return req
  }

  if (!req.headers || !req.headers.Authorization) {
    req.user = {}
    return req
  }

  const [__, token] = req.headers.Authorization.split(' ')

  if (token) {
    const user = jsonWebToken.verify(token, config.server.secret)
    req.token = token
    req.user = user
  }

  return req
}
