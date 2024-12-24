const mongoose = require('mongoose')

const schoolSchema = new mongoose.Schema(
  {
    id: { type: String, required: true , unique: true},
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
)

const School = mongoose.model('School', schoolSchema)

module.exports = School
