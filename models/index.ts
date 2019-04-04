import fs from 'fs'
import mongoose from 'mongoose'
import { MONGODB_URI } from '../utils'

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'index.ts'))
  .forEach((file) => {
    const model = require(`./${file}`).default
    mongoose.model(model.name, model.schema)
  })

mongoose.Promise = global.Promise
export const database = mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
