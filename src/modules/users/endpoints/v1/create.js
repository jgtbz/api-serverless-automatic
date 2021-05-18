import App from '../../../../app/lib'

const middleware = async ({ name }) => {
  await App.AWS.SNS.send({ topic: 'users-create', message: { from: 'Endpoint', name } })
  return {
    status: 200,
    message: `Usuário cadastrado: ${name}`
  }
}

export const handler = App.Endpoints.register({
  path: '/create',
  method: 'POST',
  isPublic: false,
  database: true,
  middlewares: [
    middleware
  ]
})
