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

    next(decoded)
  }
}
