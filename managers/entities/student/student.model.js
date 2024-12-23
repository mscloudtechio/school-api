const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    grade: { type: String, required: true },
    profile: { type: Object, required: false },
  },
  { timestamps: true }
)

const Student = mongoose.model('Student', studentSchema)
module.exports = Student
