import App from '../../../app/lib'

App.Consumers.register({
  topic: 'birthday',
  queue: 'send-email-birthdate',
  concurrency: 1,
  timeout: 900
})

export const handler = ({ name }) => {
  console.log(`Enviando Email de Aniversário para o Usuário: ${name}`)
}
