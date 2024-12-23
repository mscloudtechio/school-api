const mongoose = require('mongoose')
const { Schema } = mongoose
const { nanoid } = require('nanoid')

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['superadmin', 'school_admin', 'student'],
      default: 'student',
    },
    key: {
      type: String,
      unique: true,
      default: () => nanoid(),
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: function () {
        return this.role === 'school_admin' || this.role === 'student'
      },
    },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

module.exports = User
