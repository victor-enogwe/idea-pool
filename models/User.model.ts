import { Schema, Document, model } from 'mongoose'
import { modelOptions } from '../utils'

const UserSchema = new Schema({}, modelOptions)

model<Document>('User', UserSchema)
