const http = require('http')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

const app = express()

module.exports = class UserServer {
  constructor({ config, managers }) {
    this.config = config
    this.userApi = managers.userApi
  }

  use(args) {
    app.use(args)
  }

  run() {
    app.use(helmet())

    app.use(cors({ origin: this.config.dotEnv.ALLOWED_ORIGINS || '*' }))

    app.use(express.json({ limit: '10kb' }))
    app.use(express.urlencoded({ extended: true, limit: '10kb' }))

    app.use(cookieParser())

    app.use(morgan('combined'))

    app.use('/static', express.static('public'))

    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        ok: false,
        code: 429,
        errors: 'Too many requests, please try again later.',
      },
    })
    app.use('/api', apiLimiter)


    app.all('/api/:moduleName/:fnName', this.userApi.mw)

    const server = http.createServer(app)
    server.listen(this.config.dotEnv.USER_PORT, () => {
      console.log(
        `${this.config.dotEnv.SERVICE_NAME.toUpperCase()} is running on port: ${
          this.config.dotEnv.USER_PORT
        }`
      )
    })
  }
}
