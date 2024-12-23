module.exports = ({ meta, config, managers }) => {
  return async ({ req, res, next }) => {
    if (!req.headers.token) {
      console.log('Token required but not found')
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: 'Unauthorized',
      })
    }

    let decoded = null
    try {
      decoded = managers.token.verifyShortToken({ token: req.headers.token })

      if (!decoded) {
        console.log('Failed to decode token')
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 401,
          errors: 'Unauthorized',
        })
      }
    } catch (err) {
      console.log('Token decoding error')
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: 'Unauthorized',
      })
    }

    if (!decoded.role) {
      console.log('Role not found in token')
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 403,
        errors: 'Forbidden: Role not specified',
      })
    }

    if (
      decoded.role === 'superadmin' ||
      decoded.role === 'school_admin' ||
      decoded.role === 'student'
    ) {
      next(decoded)
    } else {
      console.log('Invalid role in token')
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 403,
        errors: 'Forbidden: Invalid role',
      })
    }
  }
}
