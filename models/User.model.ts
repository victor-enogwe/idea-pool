import { Schema } from 'mongoose'
import { virtuals } from '../utils'

export default {
  name: 'User',
  schema: new Schema({}, { timestamps: true, toJSON: virtuals, toObject: virtuals })
}
