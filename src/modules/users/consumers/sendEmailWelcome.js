import App from '../../../app'

App.Consumers.register({
  topic: 'create',
  queue: 'send-email-welcome',
  concurrency: 1,
  timeout: 900
})

export const handler = ({ name }) => {
  console.log(`Enviando Email de Bem Vindo para o Usuário: ${name}`)
}
