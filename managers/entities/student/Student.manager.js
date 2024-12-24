const Student = require('./student.model')
const School = require('../school/school.model')
const Classroom = require('../classroom/classroom.model')
const User = require('../user/user.model')

module.exports = class StudentManager {
  constructor({ cache, utils, managers, validators }) {
    this.cache = cache
    this.utils = utils
    this.managers = managers
    this.validators = validators
    this.prefix = 'student'
    this.httpExposed = [
      'post=create',
      'put=update',
      'delete=delete',
      'get=get',
      'get=list',
    ]
  }

  /**
   * Creates a new student and stores it in the database.
   */
  async create({
    __shortToken,
    schoolId,
    classId,
    name,
    age,
    grade,
    profile,
    res,
  }) {
    const studentData = { schoolId, classId, name, age, grade, profile }
    await this.validators.student.create(studentData).catch((err) => {
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 400,
        errors: err,
      })
    })

    try {
      const userId = __shortToken.userId
      const user = await User.findById(userId)
      if (!user || !['superadmin', 'school_admin'].includes(user.role)) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: Invalid role',
        })
      }

      if (user.role === 'school_admin' && user.school.toString() !== schoolId) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: You can only manage students for your school',
        })
      }

      // Check school and classroom existence
      const schoolExists = await School.exists({ _id: schoolId })
      if (!schoolExists) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `School with ID ${schoolId} not found`,
        })
      }

      const classroomExists = await Classroom.exists({ _id: classId, schoolId })
      if (!classroomExists) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `Classroom with ID ${classId} does not belong to School ${schoolId}`,
        })
      }

      // Save student to database
      const newStudent = new Student(studentData)
      await newStudent.save()

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: newStudent,
      })
    } catch (err) {
      console.error('Error creating student:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Updates a student's information.
   */
  async update({ __shortToken, studentId, updates, res }) {
    await this.validators.student.update(updates).catch((err) => {
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 400,
        errors: err,
      })
    })

    try {
      const userId = __shortToken.userId
      const user = await User.findById(userId)

      if (!user || !['superadmin', 'school_admin'].includes(user.role)) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: Invalid role',
        })
      }

      // Fetch student and check school ownership for school_admin
      const student = await Student.findById(studentId)
      if (!student) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `Student with ID ${studentId} not found`,
        })
      }

      if (
        user.role === 'school_admin' &&
        user.school.toString() !== student.schoolId.toString()
      ) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: You can only manage students for your school',
        })
      }

      // Update student
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        updates,
        { new: true }
      )

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: updatedStudent,
      })
    } catch (err) {
      console.error('Error updating student:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Deletes a student by their ID.
   */
  async delete({ __shortToken, studentId, res }) {
    try {
      // Role validation
      const userId = __shortToken.userId
      const user = await User.findById(userId)

      if (!user || !['superadmin', 'school_admin'].includes(user.role)) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: Invalid role',
        })
      }

      // Fetch student and check school ownership for school_admin
      const student = await Student.findById(studentId)
      if (!student) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `Student with ID ${studentId} not found`,
        })
      }

      if (
        user.role === 'school_admin' &&
        user.school.toString() !== student.schoolId.toString()
      ) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: You can only manage students for your school',
        })
      }

      // Delete student
      await Student.deleteOne({ _id: studentId })

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: { success: true },
      })
    } catch (err) {
      console.error('Error deleting student:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Retrieves a student by their ID.
   */
  async get({ studentId, res }) {
    try {
      const student = await Student.findById(studentId)
        .populate('schoolId')
        .populate('classId')

      if (!student) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `Student with ID ${studentId} not found`,
        })
      }

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: student,
      })
    } catch (err) {
      console.error('Error fetching student:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Lists all students for a specific school.
   */
  async list({ schoolId, res }) {
    try {
      const students = await Student.find({ schoolId }).populate('classId')

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: students,
      })
    } catch (err) {
      console.error('Error listing students:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }
}
