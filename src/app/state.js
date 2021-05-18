import { uniqBy } from './utils'

const state = {
  topics: [],
  queues: [],
  schedules: [],
  endpoints: [],
  config: {
    project: '',
    database: {
      URI: '',
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    aws: {
      id: '',
      region: ''
    },
    stage: ''
  },
  addTopic: function (value) {
    this.topics = uniqBy('name', [...this.topics, value])
  },
  addQueue: function (value) {
    this.queues = [...this.queues, value]
  },
  addSchedule: function (value) {
    this.schedules = [...this.schedules, value]
  },
  addEndpoint: function (value) {
    this.endpoints = [...this.endpoints, value]
  },
  setConfig: function (value) {
    this.config = value
  }
}

export default state
