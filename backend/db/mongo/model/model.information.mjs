'use strict'

import mongoose from 'mongoose'
import IdSequence from './model.sequences.mjs'

const Schema = mongoose.Schema

const informationSchema = new Schema({
  id: { type: Number, required: true, index: true, unique: true },
  customerId: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  body: { type: String, required: true },
  image: {
    url: { type: String },
    lgSize: { type: String },
    smSize: { type: String },
    lgPosition: { type: String },
    smPosition: { type: String },
    lgParallax: { type: Boolean },
    smParallax: { type: Boolean },
  },
  position: { type: Number },
  tags: [{ type: String }],
},{
  versionKey: false,
  timestamp: true
})

informationSchema.pre('validate', async function(next) {
  if (this.isNew) {
    const idSeq = await IdSequence.findOneAndUpdate(
      { idKey: 'informationId' },
      { $inc: { idValue: 1 } },
      { new: true, upsert: true }
    )
    this.id = idSeq.idValue
    this.position ||= 1
  }
  return next()
})

export default mongoose.model('information', informationSchema)
