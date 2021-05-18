import fs from 'fs'
import yaml from 'write-yaml'
import state from './state'
import { capitalizeKebabCase } from './utils'

const serviceName = (name, suffix) => `${capitalizeKebabCase(name)}${suffix}`
const kebabCase = (...values) => values.join('-')
const topicRef = (value) => `!Ref ${serviceName(value, 'Topic')}`

const hasService = (module, service) => fs.readdirSync(`src/modules/${module}/${service}`)
const runEndpoints = (module) => {
  const versions = fs.readdirSync(`src/modules/${module}/endpoints`)
  versions.forEach(version => {
    const services = fs.readdirSync(`src/modules/${module}/endpoints/${version}`)
    services.forEach(value => {
      require(`../modules/${module}/endpoints/${version}/${value}`)
    })
  })
}
const runConsumers = (module) => {
  const services = fs.readdirSync(`src/modules/${module}/consumers`)
  services.forEach(service => {
    require(`../modules/${module}/consumers/${service}`)
  })
}
const runSchedules = (module) => {
  const services = fs.readdirSync(`src/modules/${module}/schedules`)
  services.forEach(service => {
    require(`../modules/${module}/schedules/${service}`)
  })
}

const buildServiceName = (value, { name }) => serviceName(name, value)
const buildService = (value, service, callback) => value.reduce((result, item) => ({
  ...result,
  [buildServiceName(service, item)]: callback(item)
}), {})

const prepareState = (state) => {
  const modules = fs.readdirSync('src/modules')

  modules.forEach(module => {
    const hasEndpoints = hasService(module, 'endpoints')
    hasEndpoints && runEndpoints(module)

    const hasConsumers = hasService(module, 'consumers')
    hasConsumers && runConsumers(module)

    const hasSchedules = hasService(module, 'schedules')
    hasSchedules && runSchedules(module)
  })

  return Promise.resolve(state)
}

const buildModuleTopics = (state) => buildService(state.topics, 'Topic', ({ name }) => ({
  Type: 'AWS::SNS::Topic',
  Properties: {
    TopicName: kebabCase(state.config.project, name, state.config.stage)
  }
}))
const buildModuleQueues = (state) => buildService(state.queues, 'Queue', ({ name, options }) => ({
  Type: 'AWS::SNS::Queue',
  Properties: {
    QueueName: kebabCase(state.config.project, name, state.config.stage),
    DelaySeconds: options.timeout,
    FifoQueue: options.fifo
  }
}))
const buildModuleSubscriptions = (state) => buildService(state.queues, 'Subscription', ({ topic, name }) => ({
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
const buildModuleResources = (state) => {
  const topics = buildModuleTopics(state)
  const queues = buildModuleQueues(state)
  const subscriptions = buildModuleSubscriptions(state)

  yaml.sync('./serverless.modules.resources.yml', {
    ...topics,
    ...queues,
    ...subscriptions
  })

  return Promise.resolve(state)
}
const buildModulesEndpoints = (state) => {
  const endpoints = buildService(state.endpoints, 'Endpoint', ({ module, version, name, path, options }) => ({
    name: kebabCase(state.config.project, 'endpoints', name, state.config.stage),
    handler: `${path}.handler`,
    timeout: 30,
    events: [
      {
        http: {
          path: `${module}/${version}/${options.path}`,
          method: options.method
        }
      }
    ]
  }))

  yaml.sync('./serverless.modules.endpoints.yml', endpoints)

  return Promise.resolve(state)
}
const buildModulesConsumers = (state) => {
  const consumers = buildService(state.queues, 'Consumer', ({ name, path, options }) => ({
    name: kebabCase(state.config.project, 'consumers', name, state.config.stage),
    handler: `${path}.handler`,
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

  yaml.sync('./serverless.modules.consumers.yml', consumers)

  return Promise.resolve(state)
}
const buildModulesSchedules = (state) => {
  const schedules = buildService(state.schedules, 'Schedule', ({ name, path, options }) => ({
    name: kebabCase(state.config.project, 'schedules', name, state.config.stage),
    handler: `${path}.handler`,
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

  yaml.sync('./serverless.modules.schedules.yml', schedules)

  return Promise.resolve(state)
}

const start = (config) => {
  state.setConfig(config)
  prepareState(state)
    .then(buildModuleResources)
    .then(buildModulesEndpoints)
    .then(buildModulesConsumers)
    .then(buildModulesSchedules)
}

export default {
  start
}
