const Classroom = require('./classroom.model')
const School = require('../school/school.model')
const User = require('../user/user.model')

module.exports = class ClassroomManager {
  constructor({ cache, utils, managers, validators }) {
    this.cache = cache
    this.utils = utils
    this.managers = managers
    this.validators = validators
    this.prefix = 'classroom'
    this.httpExposed = [
      'post=create',
      'get=get',
      'put=update',
      'delete=delete',
      'get=list',
    ]
  }

  /**
   * Creates a new classroom and stores it in the database.
   */
  async create({ __shortToken, schoolId, name, capacity, resources, res }) {
    try {
      // Validate input
      const classroomData = { schoolId, name, capacity, resources }
      const validationResult = await this.validators.classroom.create(
        classroomData
      )
      if (validationResult) return validationResult

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

      if (user.role === 'school_admin' && user.school.toString() !== schoolId) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: You can only manage classrooms for your school',
        })
      }

      // Check school existence
      const schoolExists = await School.exists({ _id: schoolId })
      if (!schoolExists) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `School with ID ${schoolId} not found`,
        })
      }

      const newClassroom = new Classroom(classroomData)
      await newClassroom.save()

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: newClassroom,
      })
    } catch (err) {
      console.error('Error creating classroom:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Retrieves a classroom by its ID.
   */
  async get({ classroomId, res }) {
    try {
      const validationResult = await this.validators.classroom.get({
        classroomId,
      })
      if (validationResult) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 400,
          errors: validationResult,
        })
      }

      const classroom = await Classroom.findById(classroomId).populate(
        'schoolId'
      )

      if (!classroom) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `Classroom with ID ${classroomId} not found`,
        })
      }

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: classroom,
      })
    } catch (err) {
      console.error('Error fetching classroom:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Updates an existing classroom.
   */
  async update({ __shortToken, classroomId, updates, res }) {
    try {
      // Validate updates
      const validationResult = await this.validators.classroom.update(updates)
      if (validationResult) return validationResult

      const userId = __shortToken.userId
      const user = await User.findById(userId)
      if (!user || !['superadmin', 'school_admin'].includes(user.role)) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: Invalid role',
        })
      }

      const classroom = await this.get({ classroomId, res })
      if (!classroom) return

      if (
        user.role === 'school_admin' &&
        user.school.toString() !== classroom.schoolId.toString()
      ) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: You can only manage classrooms for your school',
        })
      }

      const updatedClassroom = await Classroom.findByIdAndUpdate(
        classroomId,
        updates,
        {
          new: true,
        }
      )

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: updatedClassroom,
      })
    } catch (err) {
      console.error('Error updating classroom:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Deletes a classroom by its ID.
   */
  async delete({ __shortToken, classroomId, res }) {
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

      const classroom = await this.get({ classroomId, res })
      if (!classroom) return

      if (
        user.role === 'school_admin' &&
        user.school.toString() !== classroom.schoolId.toString()
      ) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: You can only manage classrooms for your school',
        })
      }

      await Classroom.deleteOne({ _id: classroomId })

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: { success: true },
      })
    } catch (err) {
      console.error('Error deleting classroom:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Lists all classrooms for a specific school.
   */
  async list({ schoolId, res }) {
    try {
      const validationResult = await this.validators.classroom.list({
        schoolId,
      })
      if (validationResult) return validationResult

      const classrooms = await Classroom.find({ schoolId })
      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: classrooms,
      })
    } catch (err) {
      console.error('Error listing classrooms:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }
}
