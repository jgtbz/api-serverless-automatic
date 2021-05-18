import mongoose from 'mongoose'
import schema from './schema'

const name = 'logs'

const Schema = new mongoose.Schema(schema, {
  timestamps: true
})

const Model = mongoose.model(name, Schema, name)

export default Model
