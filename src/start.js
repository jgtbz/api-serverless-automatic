import fs from 'fs'
import yaml from 'write-yaml'

import { state } from './app'
import config from './config'

const capitalize = ([first = '', ...rest]) => first.toUpperCase() + rest.join('').toLowerCase()
const capitalizeName = (value = '') => {
  const names = value.split('-')
  return names.map(capitalize).join('')
}

const startState = () => {
  const [_, ...modules] = fs.readdirSync('src/modules')
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
}

const start = () => {
  startState()

  const topics = state.topics.reduce((result, { name }) => ({
    ...result,
    [capitalizeName(name) + 'Topic']: {
      Type: 'AWS::SNS::Topic',
      Properties: {
        TopicName: config.project + '-' + name + '-' + config.stage
      }
    }
  }), {})
  const queues = state.queues.reduce((result, { name, options }) => ({
    ...result,
    [capitalizeName(name) + 'Queue']: {
      Type: 'AWS::SNS::Queue',
      Properties: {
        QueueName: config.project + '-' + name + '-' + config.stage,
        DelaySeconds: options.timeout,
        FifoQueue: options.fifo
      }
    }
  }), {})
  const subscriptions = state.queues.reduce((result, { topic, name }) => ({
    ...result,
    [capitalizeName(name) + 'Subscription']: {
      Type: 'AWS::SNS::Subscription',
      Properties: {
        TopicArn: '!Ref' + ' ' + capitalizeName(topic) + 'Topic',
        Endpoint: {
          'Fn::GetAtt:': [
            capitalizeName(name) + 'Queue',
            'Arn'
          ]
        },
        Protocol: 'sqs'
      }
    }
  }), {})
  const consumers = state.queues.reduce((result, { name, path, options }) => ({
    ...result,
    [capitalizeName(name) + 'Consumer']: {
      name: config.project + '-' + name + '-' + config.stage,
      handler: path + '.handler',
      timeout: options.timeout,
      reservedConcurrency: options.concurrency,
      events: [
        {
          sqs: {
            arn: {
              'Fn::GetAtt': [
                capitalizeName(name) + 'Queue',
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
  const schedules = state.schedules.reduce((result, { name, path, options }) => ({
    ...result,
    [capitalizeName(name) + 'Schedule']: {
      name: config.project + '-' + 'schedules' + '-' + name + '-' + config.stage,
      handler: path + '.handler',
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
  const endpoints = state.endpoints.reduce((result, { name, path, options }) => ({
    ...result,
    [capitalizeName(name) + 'Endpoint']: {
      name: config.project + '-' + 'endpoints-' + '-' + name + '-' + config.stage,
      handler: path + '.handler',
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

  const resourcesModules = { ...topics, ...queues, ...subscriptions }
  const resourcesConsumers = { ...consumers }
  const resourcesSchedules = { ...schedules }
  const resourcesEndpoints = { ...endpoints }

  yaml.sync('./serverless.modules.resources.yml', resourcesModules)
  yaml.sync('./serverless.modules.consumers.yml', resourcesConsumers)
  yaml.sync('./serverless.modules.schedules.yml', resourcesSchedules)
  yaml.sync('./serverless.modules.endpoints.yml', resourcesEndpoints)
}

start()
