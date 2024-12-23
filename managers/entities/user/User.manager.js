const UserModel = require('./user.model')

module.exports = class User {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config
    this.cortex = cortex
    this.validators = validators
    this.mongomodels = mongomodels
    this.tokenManager = managers.token
    this.responseDispatcher = managers.responseDispatcher
    this.usersCollection = 'users'
    this.httpExposed = ['post=create', 'post=login', 'put=update']
  }

  /**
   * Creates a new user (restricted to superadmins only).
   * @param {object} __shortToken - Decoded short token for role validation.
   * @param {string} username - The username of the new user.
   * @param {string} email - The email of the new user.
   * @param {string} password - The password of the new user.
   * @param {string} role - The role of the new user.
   * @param {string} schoolId - The school ID for the user (if applicable).
   * @param {object} res - The response object.
   * @returns {Promise<object>} - The created user and their token.
   */
  async create({
    __shortToken,
    username,
    email,
    password,
    role,
    schoolId,
    res,
  }) {
    const adminId = __shortToken.userId
    const admin = await User.findById(adminId)

    if (!admin || admin.role !== 'superadmin') {
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 403,
        errors: 'Forbidden: Invalid role',
      })
    }

    const user = { username, email, password, role, school: schoolId }

    const result = await this.validators.user.create(user)
    if (result) {
      return this.responseDispatcher.dispatch(res, {
        ok: false,
        code: 400,
        errors: result,
      })
    }

    try {
      const newUser = new UserModel(user)
      await newUser.save()

      const longToken = this.tokenManager.genLongToken({
        userId: newUser._id,
        userKey: newUser.key,
        role: newUser.role,
        schoolId: newUser.school,
      })

      return this.responseDispatcher.dispatch(res, {
        ok: true,
        data: { user: newUser, longToken },
      })
    } catch (err) {
      console.error('Error creating user:', err.message)
      return this.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Updates an existing user's information (restricted to superadmins only).
   * @param {object} __shortToken - Decoded short token for role validation.
   * @param {string} userId - The ID of the user to update.
   * @param {object} updates - The fields to update for the user.
   * @param {object} res - The response object.
   * @returns {Promise<object>} - The updated user data.
   */
  async update({ __shortToken, userId, updates, res }) {
    const adminId = __shortToken.userId
    const admin = await User.findById(adminId)

    if (!admin || admin.role !== 'superadmin') {
      return this.managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 403,
        errors: 'Forbidden: Invalid role',
      })
    }

    const result = await this.validators.user.update(updates)
    if (result) return result

    try {
      const existingUser = await UserModel.findById(userId)

      if (!existingUser) {
        return this.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: `User with ID ${userId} not found`,
        })
      }

      Object.assign(existingUser, updates)
      await existingUser.save()

      return this.responseDispatcher.dispatch(res, {
        ok: true,
        data: existingUser,
      })
    } catch (err) {
      console.error('Error updating user:', err.message)
      return this.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }

  /**
   * Logs in a user.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @param {object} res - The response object.
   * @returns {Promise<object>} - The logged-in user's data and token.
   */
  async login({ email, password, res }) {
    const result = await this.validators.user.login({ email, password })
    if (result) {
      return this.responseDispatcher.dispatch(res, {
        ok: false,
        code: 400,
        errors: result,
      })
    }

    try {
      const user = await UserModel.findOne({ email })

      if (!user) {
        return this.responseDispatcher.dispatch(res, {
          ok: false,
          code: 404,
          errors: 'User not found',
        })
      }

      if (user.password !== password) {
        return this.responseDispatcher.dispatch(res, {
          ok: false,
          code: 401,
          errors: 'Invalid credentials',
        })
      }

      const longToken = this.tokenManager.genLongToken({
        userId: user._id,
        userKey: user.key,
        role: user.role,
        schoolId: user.school,
      })

      return this.responseDispatcher.dispatch(res, {
        ok: true,
        data: { user, longToken },
      })
    } catch (err) {
      console.error('Error logging in user:', err.message)
      return this.responseDispatcher.dispatch(res, {
        ok: false,
        code: 500,
        errors: 'Internal server error',
      })
    }
  }
}
