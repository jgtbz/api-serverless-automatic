import AWS from './AWS'
import Endpoints from './Endpoints'
import Consumers from './Consumers'
import Schedules from './Schedules'
import { pipe, uniqBy, prop, concat } from 'ramda'

const uniqByName = pipe(uniqBy(prop('name')))

export const state = {
  topics: [],
  queues: [],
  schedules: [],
  endpoints: [],
  addTopic: function (value) {
    this.topics = uniqByName(concat(this.topics, [value]))
  },
  addQueue: function (value) {
    this.queues = uniqByName(concat(this.queues, [value]))
  },
  addSchedule: function (value) {
    this.schedules = uniqByName(concat(this.schedules, [value]))
  },
  addEndpoint: function (value) {
    this.endpoints = uniqByName(concat(this.endpoints, [value]))
  }
}

export default {
  AWS,
  Endpoints: Endpoints(state),
  Consumers: Consumers(state),
  Schedules: Schedules(state)
}
