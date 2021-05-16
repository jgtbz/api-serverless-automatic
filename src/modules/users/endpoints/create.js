import { sendSNS } from '../../../app'

export default async ({ name }) => {
  await sendSNS({ topic: 'users-create', message: { from: 'Endpoint', name } })
  return {
    status: 200,
    message: `Usuário cadastrado: ${name}`
  }
}
