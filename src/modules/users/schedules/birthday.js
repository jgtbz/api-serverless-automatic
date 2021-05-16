import App from '../../../app'

App.Schedules.register({
  rate: 'rate (50 minutes)',
  timeout: 900
})

export const handler = async () => {
  console.log('Started Schedule UsersBirthday')
  const users = [
    {
      name: 'Users 1'
    },
    {
      name: 'Users 2'
    },
    {
      name: 'Users 3'
    }
  ]
  await App.Support.asyncPromise(users, ({ name }) => App.AWS.SNS.send({ topic: 'users-birthday', message: { from: 'Schedule', name } }))
  console.log('Finished Schedule UsersBirthday')
}
