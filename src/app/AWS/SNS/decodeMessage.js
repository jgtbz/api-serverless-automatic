const decodeMessage = ({ Records }) => {
  const [{ Body }] = Records
  const message = JSON.parse(Body)
  const decodedMessage = JSON.parse(message.Message)

  return decodedMessage
}

export default decodeMessage
