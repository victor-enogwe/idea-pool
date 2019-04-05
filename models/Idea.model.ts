import { Schema, model } from 'mongoose'
import { stringSchema, modelOptions } from '../utils'
import { Idea } from '../interfaces'

const ObjectId = Schema.Types.ObjectId
const numSchema = { type: Number, min: 1, max: 10, required: true }

const IdeaSchema = new Schema({
  authorId: { type: ObjectId, ref: 'User', required: true },
  content: stringSchema({ minlength: 10, maxlength: 255, required: true }),
  impact: numSchema,
  ease: numSchema,
  confidence: numSchema
}, modelOptions)

IdeaSchema.virtual('average_score').get(averageScore)

function averageScore (this: Idea) {
  return ((this.impact + this.ease + this.confidence) / 3).toFixed(1)
}

model<Idea>('Idea', IdeaSchema)
