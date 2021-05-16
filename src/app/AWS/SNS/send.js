import AWS from 'aws-sdk'
import config from '../../../config'

const send = async ({ topic, message }) => {
  const Message = typeof(message) === 'string'
    ? message
    : JSON.stringify(message)
  const TopicArn =  `arn:aws:sns:${config.aws.region}:${config.aws.id}:${config.project}-${topic}-${config.stage}`

  const params = {
    Message,
    TopicArn
  }

  const data = await new AWS.SNS().publish(params).promise()

  return data?.MessageId
}

export default send
