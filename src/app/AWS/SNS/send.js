import AWS from 'aws-sdk'

const send = (state) => async ({ topic, message }) => {
  const Message = typeof(message) === 'string'
    ? message
    : JSON.stringify(message)
  const TopicArn =  `arn:aws:sns:${state.config.aws.region}:${state.config.aws.id}:${state.config.project}-${topic}-${state.config.stage}`

  const params = {
    Message,
    TopicArn
  }

  const data = await new AWS.SNS().publish(params).promise()

  return data?.MessageId
}

export default send
