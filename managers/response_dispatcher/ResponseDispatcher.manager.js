module.exports = class ResponseDispatcher {
  constructor() {
    this.key = 'responseDispatcher'
  }

  dispatch(res, { ok, data, code, errors, message, msg }) {
    let statusCode = code ? code : ok === true ? 200 : 400

    let sanitizedData = this.sanitizeData(data)

    if (res.headersSent) {
      console.error(
        'Attempted to send response after headers were already sent.'
      )
      return
    }

    return res.status(statusCode).send({
      ok: ok || false,
      data: sanitizedData || {},
      errors: errors || [],
      message: msg || message || '',
    })
  }

  /**
   * Sanitizes data to remove circular references and non-serializable fields.
   * @param {object} data - The data to sanitize.
   * @returns {object|null} - The sanitized data.
   */
  sanitizeData(data) {
    try {
      if (!data || typeof data !== 'object') {
        return data
      }

      return JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (key === 'req' || key === 'res' || key === 'socket') {
            return undefined
          }
          return value
        })
      )
    } catch (err) {
      console.error('Error sanitizing data:', err.message)
      return null
    }
  }
}
