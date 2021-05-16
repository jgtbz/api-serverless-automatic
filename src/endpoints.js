import Modules from './modules'

export default async (event, context) => {
  const id = context.awsRequestId
  try {
    const { body, headers } = event
    const { module, endpoint, payload } = JSON.parse(body)

    console.log({
      module,
      endpoint,
      payload
    })

    const execute = Modules.getEndpoint({ module, endpoint })

    if (!execute) {
      throw { status: 404, message: 'Not Found' }
    }

    const result = await execute({ id, headers, module, endpoint, ...payload })

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error' })
    }
  }
}
