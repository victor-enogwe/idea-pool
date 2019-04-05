import fs from 'fs'
import mongoose from 'mongoose'
import { MONGODB_URI } from '../utils'

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'index.ts'))
  .forEach((file) => require(`./${file}`))

mongoose.Promise = global.Promise
export const database = mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
