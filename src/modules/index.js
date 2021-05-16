import * as usersEndpoints from './users/endpoints'

const endpoints = {
  users: usersEndpoints
}

const getEndpoint = ({ module, endpoint }) => endpoints[module]?.[endpoint] || {}

export default {
  getEndpoint
}
