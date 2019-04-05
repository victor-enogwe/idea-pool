import { Document, Types } from 'mongoose'

export interface Idea extends Document {
  id: Types.ObjectId
  content: string
  impact: number
  ease: number
  confidence: number
  average_score: number
  created_at: Date
  updated_at: Date
}
