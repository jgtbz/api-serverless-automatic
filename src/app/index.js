import AWS from './AWS'
import Consumers from './Consumers'
import Schedules from './Schedules'
import { pipe, uniqBy, prop, concat } from 'ramda'

const uniqByName = pipe(uniqBy(prop('name')))

export const state = {
  topics: [],
  queues: [],
  schedules: [],
  addTopic: function (value) {
    this.topics = uniqByName(concat(this.topics, [value]))
  },
  addQueue: function (value) {
    this.queues = uniqByName(concat(this.queues, [value]))
  },
  addSchedule: function (value) {
    this.schedules = uniqByName(concat(this.schedules, [value]))
  }
}

export default {
  AWS,
  Consumers: Consumers(state),
  Schedules: Schedules(state)
}
