const School = require('./school.model')
const User = require('../user/user.model')

module.exports = class SchoolManager {
  constructor({ cache, utils, managers }) {
    this.cache = cache
    this.utils = utils
    this.prefix = 'school'
    this.managers = managers
    this.httpExposed = [
      'post=create',
      'get=get',
      'put=update',
      'delete=delete',
      'get=list',
      'post=assignSchoolAdmin',
    ]
  }

  /**
   * Creates a new school and stores it in the database.
   */
  async create({ __shortToken, name, address, res }) {
    try {
      const superAdminId = __shortToken.userId
      const superAdmin = await User.findOne({
        _id: superAdminId,
        role: 'superadmin',
      })

      if (!superAdmin) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: Invalid role',
        })
      }

      const schoolData = { name, address }
      const newSchool = new School(schoolData)
      await newSchool.save()

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: newSchool,
      })
    } catch (err) {
      console.error('Error in creating school:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Assigns a school_admin to a specific school.
   */
  async assignSchoolAdmin({ __shortToken, schoolId, adminId, res }) {
    try {
      const superAdminId = __shortToken.userId
      const superAdmin = await User.findOne({
        _id: superAdminId,
        role: 'superadmin',
      })

      if (!superAdmin) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: Invalid role',
        })
      }

      const school = await School.findById(schoolId)
      if (!school) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `School with ID ${schoolId} not found`,
        })
      }

      const schoolAdmin = await User.findById(adminId)
      if (!schoolAdmin || schoolAdmin.role !== 'school_admin') {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 400,
          errors: 'Invalid school_admin ID or role',
        })
      }

      schoolAdmin.school = schoolId
      await schoolAdmin.save()

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: {
          message: `Admin ${schoolAdmin.username} assigned to school ${school.name}`,
        },
      })
    } catch (err) {
      console.error('Error assigning school admin:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Retrieves a school by its ID.
   */
  async get({ schoolId }) {
    const school = await School.findById(schoolId)

    if (!school) {
      throw new Error(`School with ID ${schoolId} not found`)
    }

    return school
  }

  /**
   * Updates a school's data.
   */
  async update({ __shortToken, schoolId, updates, res }) {
    try {
      const user = await User.findById(__shortToken.userId)

      if (!user || user.role !== 'superadmin') {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: Only superadmins can update schools',
        })
      }

      const existingSchool = await this.get({ schoolId })
      const updatedSchool = {
        ...existingSchool.toObject(),
        ...updates,
      }

      await School.updateOne({ _id: schoolId }, updatedSchool)

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: updatedSchool,
      })
    } catch (err) {
      console.error('Error updating school:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Deletes a school by its ID.
   */
  async delete({ __shortToken, schoolId, res }) {
    try {
      const user = await User.findById(__shortToken.userId)

      if (!user || user.role !== 'superadmin') {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 403,
          errors: 'Forbidden: Only superadmins can delete schools',
        })
      }

      const result = await School.deleteOne({ _id: schoolId })

      if (!result.deletedCount) {
        return this.managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `Failed to delete school with ID ${schoolId}`,
        })
      }

      await User.updateMany({ school: schoolId }, { $unset: { school: '' } })

      return this.managers.responseDispatcher.dispatch(res, {
        ok: true,
        data: { success: true },
      })
    } catch (err) {
      console.error('Error deleting school:', err.message)
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Lists all schools.
   */
  async list() {
    const schools = await School.find()

    if (!schools.length) {
      return []
    }

    return schools
  }
}
