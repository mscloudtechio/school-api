const config = require('./config/index.config.js')
const Cortex = require('ion-cortex')
const ManagersLoader = require('./loaders/ManagersLoader.js')
const mongoDB = config.dotEnv.MONGO_URI
  ? require('./connect/mongo')({
      uri: config.dotEnv.MONGO_URI,
    })
  : null

const validateEnv = () => {
  const requiredEnvVars = [
    'CACHE_PREFIX',
    'CACHE_REDIS',
    'CORTEX_PREFIX',
    'CORTEX_REDIS',
    'CORTEX_TYPE',
    'LONG_TOKEN_SECRET',
    'SHORT_TOKEN_SECRET',
    'NACL_SECRET',
  ]

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar] && !config.dotEnv[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  })
}

validateEnv()

const cache = require('./cache/cache.dbh')({
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS,
})

console.log(`Cache Config:`, {
  prefix: config.dotEnv.CACHE_PREFIX,
  url: config.dotEnv.CACHE_REDIS,
})

const cortex = new Cortex({
  prefix: config.dotEnv.CORTEX_PREFIX,
  url: config.dotEnv.CORTEX_REDIS,
  type: config.dotEnv.CORTEX_TYPE,
  state: () => ({}),
  activeDelay: '50ms',
  idlDelay: '200ms',
})

console.log(`Cortex Config:`, {
  prefix: config.dotEnv.CORTEX_PREFIX,
  url: config.dotEnv.CORTEX_REDIS,
  type: config.dotEnv.CORTEX_TYPE,
})

const managersLoader = new ManagersLoader({ config, cache, cortex })
const managers = managersLoader.load()

if (!managers || !managers.userServer) {
  throw new Error('Failed to load managers or userServer is not defined.')
}

managers.userServer.run()
