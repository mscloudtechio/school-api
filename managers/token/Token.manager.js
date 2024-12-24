const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')
const md5 = require('md5')

module.exports = class TokenManager {
  constructor({ config }) {
    this.config = config
    this.longTokenExpiresIn = '1y'
    this.shortTokenExpiresIn = '72h'

    this.httpExposed = ['v1_createShortToken']
  }

  /**
   * Long tokens represent a user.
   * They contain immutable data and are long-lived.
   */
  genLongToken({ userId, userKey}) {
    return jwt.sign(
      {
        userKey,
        userId,
      },
      this.config.dotEnv.LONG_TOKEN_SECRET,
      { expiresIn: this.longTokenExpiresIn }
    )
  }

  /**
   * Short tokens are issued from long tokens.
   * They represent a device and include the user role.
   */
  genShortToken({ userId, userKey, sessionId, deviceId }) {
    return jwt.sign(
      { userKey, userId, sessionId, deviceId },
      this.config.dotEnv.SHORT_TOKEN_SECRET,
      { expiresIn: this.shortTokenExpiresIn }
    )
  }

  _verifyToken({ token, secret }) {
    let decoded = null
    try {
      decoded = jwt.verify(token, secret)
    } catch (err) {
      console.log(err)
    }
    return decoded
  }

  verifyLongToken({ token }) {
    return this._verifyToken({
      token,
      secret: this.config.dotEnv.LONG_TOKEN_SECRET,
    })
  }

  verifyShortToken({ token }) {
    return this._verifyToken({
      token,
      secret: this.config.dotEnv.SHORT_TOKEN_SECRET,
    })
  }

  /**
   * Generate a short token based on a long token.
   * Includes user role and device-specific information.
   */
  v1_createShortToken({ __longToken, __device }) {
    let decoded = __longToken
    console.log(decoded)

    let shortToken = this.genShortToken({
      userId: decoded.userId,
      userKey: decoded.userKey,
      sessionId: nanoid(),
      deviceId: md5(__device),
    })

    return { shortToken }
  }
}
