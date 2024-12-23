const getParamNames = require('./_common/getParamNames')

module.exports = class ApiHandler {
  /**
   * @param {object} injectable - Dependencies for ApiHandler.
   * @param {string} prop - Property to scan for exposed methods.
   */
  constructor({ config, cortex, cache, managers, mwsRepo, prop }) {
    this.config = config
    this.cache = cache
    this.cortex = cortex
    this.managers = managers
    this.mwsRepo = mwsRepo
    this.mwsExec = this.managers.mwsExec
    this.prop = prop
    this.exposed = {}
    this.methodMatrix = {}
    this.mwsStack = {}
    this.mw = this.mw.bind(this)

    this._initializeExposedMethods()
    this._setupCortexSubscriptions()
  }

  /**
   * Initializes the exposed methods and middleware stacks.
   */
  _initializeExposedMethods() {
    console.log(`# Initializing API Handlers`)

    Object.keys(this.managers).forEach((managerKey) => {
      const manager = this.managers[managerKey]
      if (manager[this.prop]) {
        this.methodMatrix[managerKey] = {}
        console.log(`############### Loading manager: ${managerKey}`)
        manager[this.prop].forEach((methodConfig) => {
          const [method, fnName] = this._parseMethodConfig(methodConfig)

          if (!this.methodMatrix[managerKey][method]) {
            this.methodMatrix[managerKey][method] = []
          }
          this.methodMatrix[managerKey][method].push(fnName)

          const params = this._extractMethodParams(manager, fnName)
          this._initializeMiddlewareStack(managerKey, fnName, params)

          console.log(`* ${methodConfig} : args=`, params)
        })
      }
    })
  }

  /**
   * Parses method configuration strings like `post=createSchool`.
   */
  _parseMethodConfig(config) {
    const [method = 'post', fnName] = config.includes('=')
      ? config.split('=')
      : ['post', config]
    return [method, fnName]
  }

  /**
   * Extracts method parameter names using `getParamNames`.
   */
  _extractMethodParams(manager, fnName) {
    const params = getParamNames(manager[fnName])

    return params.map((param) => param.trim().replace(/[{}/]/g, ''))
  }

  /**
   * Initializes the middleware stack for a specific method.
   */
  _initializeMiddlewareStack(managerKey, fnName, params) {
    params.forEach((param) => {
      if (!this.mwsStack[`${managerKey}.${fnName}`]) {
        this.mwsStack[`${managerKey}.${fnName}`] = []
      }
      if (param.startsWith('__') && this.mwsRepo[param]) {
        this.mwsStack[`${managerKey}.${fnName}`].push(param)
      } else if (param.startsWith('__')) {
        throw new Error(`Middleware ${param} not found in repository`)
      }
    })
  }

  /**
   * Sets up Cortex subscriptions for module methods.
   */
  _setupCortexSubscriptions() {
    console.log(`# Setting up Cortex subscriptions`)

    this.cortex.sub('*', (data, meta, cb) => {
      const targetModule = this.managers[moduleName]

      if (!targetModule || !targetModule.interceptor) {
        return cb({
          error: `Module ${moduleName} or method ${fnName} not found`,
        })
      }

      try {
        targetModule.interceptor({ data, meta, cb, fnName })
      } catch (err) {
        console.error(`Cortex Execution Error: ${err.message}`)
        cb({ error: `Failed to execute ${fnName}: ${err.message}` })
      }
    })
  }

  /**
   * Executes a target method with the provided data.
   */
  async _exec({ targetModule, fnName, cb, data }) {
    try {
      const result = await targetModule[fnName](data)
      cb?.(result)
      return result
    } catch (err) {
      console.error(`Execution Error in ${fnName}:`, err)
      return { error: `${fnName} failed to execute: ${err.message}` }
    }
  }

  /**
   * Middleware to handle HTTP requests for APIs.
   */
  async mw(req, res) {
    const method = req.method.toLowerCase()
    const { moduleName, fnName } = req.params

    const moduleMatrix = this.methodMatrix[moduleName]
    if (!moduleMatrix) {
      return this._respondWithError(res, `Module ${moduleName} not found`)
    }

    const availableMethods = moduleMatrix[method]
    if (!availableMethods || !availableMethods.includes(fnName)) {
      return this._respondWithError(
        res,
        `Method ${fnName} not found for ${moduleName}`
      )
    }

    const targetStack = this.mwsStack[`${moduleName}.${fnName}`]
    const hotBolt = this.mwsExec.createBolt({
      stack: targetStack,
      req,
      res,
      onDone: async ({ req, res, results }) => {
        const data = { ...req.body, ...results, res }
        const result = await this._exec({
          targetModule: this.managers[moduleName],
          fnName,
          data,
        })

        if (result?.selfHandleResponse) return
        if (result?.errors || result?.error) {
          return this._respondWithError(res, result.error || result.errors)
        }
        this.managers.responseDispatcher.dispatch(res, {
          ok: true,
          data: result,
        })
      },
    })

    hotBolt.run()
  }

  /**
   * Sends an error response.
   */
  _respondWithError(res, error) {
    console.error(`API Error: ${error}`)
    this.managers.responseDispatcher.dispatch(res, {
      ok: false,
      message: error,
    })
  }
}
