import fs from 'fs'
import yaml from 'write-yaml'
import { pipe, juxt, head, toUpper, tail, join, concat } from 'ramda'

import { state } from './app'
import config from './config'

config.project = 'basic'
config.stage = 'dev'

const capitalize = pipe(
  juxt([pipe(head, toUpper), tail]),
  join('')
)
const capitalizeKebabCase = (value = '') => {
  const names = value.split('-')
  return names.map(capitalize).join('')
}

const prepareState = (state) => {
  const modules = fs.readdirSync('src/modules')

  modules.forEach(module => {
    const hasEndpoints = fs.existsSync(`src/modules/${module}/endpoints`)

    if (hasEndpoints) {
      const endpoints = fs.readdirSync(`src/modules/${module}/endpoints`)
      endpoints.forEach(endpoint => {
        require(`./modules/${module}/endpoints/${endpoint}`)
      })
    }
    
    const hasConsumers = fs.existsSync(`src/modules/${module}/consumers`)

    if (hasConsumers) {
      const consumers = fs.readdirSync(`src/modules/${module}/consumers`)
      consumers.forEach(consumer => {
        require(`./modules/${module}/consumers/${consumer}`)
      })
    }

    const hasSchedules = fs.existsSync(`src/modules/${module}/schedules`)

    if (hasSchedules) {
      const schedules = fs.readdirSync(`src/modules/${module}/schedules`)
      schedules.forEach(schedule => {
        require(`./modules/${module}/schedules/${schedule}`)
      })
    }
  })

  return Promise.resolve(state)
}

const serviceName = (name, suffix) => concat(capitalizeKebabCase(name), suffix)
const kebabCase = (...values) => join('-', values)
const topicRef = (value) => concat('!Ref ', serviceName(value, 'Topic'))

const buildModuleTopics = (state) => state.topics.reduce((result, { name }) => ({
  ...result,
  [serviceName(name, 'Topic')]: {
    Type: 'AWS::SNS::Topic',
    Properties: {
      TopicName: kebabCase(config.project, name, config.stage)
    }
  }
}), {})
const buildModuleQueues = (state) => state.queues.reduce((result, { name, options }) => ({
  ...result,
  [serviceName(name, 'Queue')]: {
    Type: 'AWS::SNS::Queue',
    Properties: {
      QueueName: kebabCase(config.project, name, config.stage),
      DelaySeconds: options.timeout,
      FifoQueue: options.fifo
    }
  }
}), {})
const buildModuleSubscriptions = (state) => state.queues.reduce((result, { topic, name }) => ({
  ...result,
  [serviceName(name, 'Subscription')]: {
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
  }
}), {})

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
  const endpoints = state.endpoints.reduce((result, { name, path, options }) => ({
    ...result,
    [serviceName(name, 'Endpoint')]: {
      name: kebabCase(config.project, 'endpoints', name, config.stage),
      handler: concat(path, '.handler'),
      timeout: 30,
      events: [
        {
          http: {
            path: options.path,
            method: options.method
          }
        }
      ]
    }
  }), {})

  yaml.sync('./serverless.modules.endpoints.yml', endpoints)

  return Promise.resolve(state)
}
const buildModulesConsumers = (state) => {
  const consumers = state.queues.reduce((result, { name, path, options }) => ({
    ...result,
    [capitalizeKebabCase(name) + 'Consumer']: {
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
    }
  }), {})

  yaml.sync('./serverless.modules.consumers.yml', consumers)

  return Promise.resolve(state)
}
const buildModulesSchedules = (state) => {
  const schedules = state.schedules.reduce((result, { name, path, options }) => ({
    ...result,
    [capitalizeKebabCase(name) + 'Schedule']: {
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
    }
  }), {})

  yaml.sync('./serverless.modules.schedules.yml', schedules)

  return Promise.resolve(state)
}

const start = (state) => prepareState(state)
  .then(buildModuleResources)
  .then(buildModulesEndpoints)
  .then(buildModulesConsumers)
  .then(buildModulesSchedules)

start(state)
