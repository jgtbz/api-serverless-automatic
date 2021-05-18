import mongoose from 'mongoose'

const connect = async ({ URI, options = { useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true } }) => mongoose
  .connect(URI, options)
  .then(() => `Connected on MongoDB: ${URI}.`)

export default connect
