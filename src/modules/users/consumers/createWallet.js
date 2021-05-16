import App from '../../../app'

App.Consumers.register({
  topic: 'create',
  queue: 'create-wallet',
  concurrency: 1,
  timeout: 900
})

export const handler = ({ name }) => {
  console.log(`Criando a carteira para o Usuário: ${name}`)
}
