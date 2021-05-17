import fs from 'fs'
import yaml from 'write-yaml'
import state from './state'
import { capitalizeKebabCase } from './utils'

const serviceName = (name, suffix) => `${capitalizeKebabCase(name)}${suffix}`
const kebabCase = (...values) => values.join('-')
const topicRef = (value) => `!Ref ${serviceName(value, 'Topic')}`

const hasService = (module, service) => fs.readdirSync(`src/modules/${module}/${service}`)
const runServices = (module, service) => {
  const services = fs.readdirSync(`src/modules/${module}/${service}`)
  services.forEach(value => {
    require(`../modules/${module}/${service}/${value}`)
  })
}

const buildServiceName = (value, { name }) => serviceName(name, value)
const buildService = (value, service, callback) => value.reduce((result, item) => ({
  ...result,
  [buildServiceName(service, item)]: callback(item)
}), {})

const prepareState = ({ config, state }) => { 
  const modules = fs.readdirSync('src/modules')

  modules.forEach(module => {
    const hasEndpoints = hasService(module, 'endpoints')
    hasEndpoints && runServices(module, 'endpoints')

    const hasConsumers = hasService(module, 'consumers')
    hasConsumers && runServices(module, 'consumers')

    const hasSchedules = hasService(module, 'schedules')
    hasSchedules && runServices(module, 'schedules')
  })

  return Promise.resolve({ config, state })
}

const buildModuleTopics = ({ config, state }) => buildService(state.topics, 'Topic', ({ name }) => ({
  Type: 'AWS::SNS::Topic',
  Properties: {
    TopicName: kebabCase(config.project, name, config.stage)
  }
}))
const buildModuleQueues = ({ config, state }) => buildService(state.topics, 'Queue', ({ name, options }) => ({
  Type: 'AWS::SNS::Queue',
  Properties: {
    QueueName: kebabCase(config.project, name, config.stage),
    DelaySeconds: options.timeout,
    FifoQueue: options.fifo
  }
}))
const buildModuleSubscriptions = ({ state }) => buildService(state.topics, 'Subscription', ({ topic, name }) => ({
  Type: 'AWS::SNS::Subscription',
  Properties: {
    TopicArn: topicRef(topic),
    Endpoint: {
      'Fn::GetAtt:': [
        serviceName(name, 'Queue'),
        'Arn'
      ]
    },
    Protocol: 'sqs'
  }
}))
const buildModuleResources = ({ config, state }) => {
  const topics = buildModuleTopics({ config, state })
  const queues = buildModuleQueues({ config, state })
  const subscriptions = buildModuleSubscriptions({ config, state })

  yaml.sync('./serverless.modules.resources.yml', {
    ...topics,
    ...queues,
    ...subscriptions
  })

  return Promise.resolve({ config, state })
}
const buildModulesEndpoints = ({ config, state }) => buildService(state.topics, 'Endpoint', ({ name, options }) => ({
  name: kebabCase(config.project, 'endpoints', name, config.stage),
  handler: `${path}.handler`,
  timeout: 30,
  events: [
    {
      http: {
        path: options.path,
        method: options.method
      }
    }
  ]
}))
const buildModulesConsumers = ({ config, state }) => buildService(state.topics, 'Consumer', ({ name, options }) => ({
  name: kebabCase(config.project, 'consumers', name, config.stage),
  handler: concat(path, '.handler'),
  timeout: options.timeout,
  reservedConcurrency: options.concurrency,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': [
            serviceName(name, 'Queue'),
            'Arn'
          ]
        },
        batchSize: options.batchSize,
        enabled: true
      }
    }
  ]
}))
const buildModulesSchedules = ({ config, state }) => buildService(state.topics, 'Schedule', ({ name, options }) => ({
  name: kebabCase(config.project, 'schedules', name, config.stage),
  handler: concat(path, '.handler'),
  timeout: options.timeout,
  events: [
    {
      schedule: {
        rate: options.rate,
        enabled: true
      }
    }
  ]
}))

const start = (config) => prepareState({ config, state })
  .then(buildModuleResources)
  .then(buildModulesEndpoints)
  .then(buildModulesConsumers)
  .then(buildModulesSchedules)

export {
  start
}
