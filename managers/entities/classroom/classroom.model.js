const mongoose = require('mongoose')

const classroomSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    resources: { type: Object, required: false },
  },
  { timestamps: true }
)

const Classroom = mongoose.model('Classroom', classroomSchema)
module.exports = Classroom
