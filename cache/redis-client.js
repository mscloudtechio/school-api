const Redis = require('ioredis')

const runTest = async (redis, prefix) => {
  try {
    const key = `${prefix}:test:${new Date().getTime()}`
    await redis.set(key, 'Redis Test Done.')
    await redis.get(key)
    await redis.del(key)
  } catch (error) {
    console.error('Error during Redis test:', error)
  }
}

const createClient = ({
  prefix = 'default',
  url = 'redis://127.0.0.1:6379',
  testConnection = true,
}) => {
  if (!prefix) throw new Error('Redis prefix is missing.')
  if (!url) throw new Error('Redis URL is missing.')

  console.log({ prefix, url })

  const redis = new Redis(url, {
    keyPrefix: prefix + ':',
    connectTimeout: 10000, // 10 seconds
  })

  // Register client events
  redis.on('error', (error) => {
    console.error('Redis error:', error)
  })

  redis.on('end', () => {
    console.error('Redis connection lost.')
  })

  // Optional connection test
  if (testConnection) {
    runTest(redis, prefix)
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    redis.quit()
    console.log('Redis client disconnected.')
    process.exit(0)
  })

  return redis
}

exports.createClient = createClient
