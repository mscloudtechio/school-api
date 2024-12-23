const utils = require('../libs/utils')
const { performance } = require('perf_hooks')

const keyCheck = (key) => {
  if (!key) throw Error('Cache Key is missing')
}

module.exports = ({ prefix, url }) => {
  if (!prefix || !url) throw Error('missing in memory arguments')

  /** creating in-memory client */
  const redisClient = require('./redis-client').createClient({
    prefix,
    url,
  })

  redisClient.on('error', (error) => {
    console.log('Redis Error:', error)
  })

  redisClient.on('end', () => {
    console.log('Redis connection lost, shutting down...')
  })

  const runTest = async () => {
    const key = `${prefix}:test:${new Date().getTime()}`
    await redisClient.set(key, 'Redis Test Done.')
    const data = await redisClient.get(key)
    console.log(`Cache Test Data: ${data}`)
    redisClient.del(key)
  }

  runTest()

  return {
    search: {
      createIndex: async ({ index, prefix, schema }) => {
        if (!schema || !prefix || !index) {
          throw Error('Missing arguments for index creation')
        }
        let indices = await redisClient.call('FT._LIST')
        console.log('Existing indices:', indices)

        if (indices.includes(index)) {
          await redisClient.call('FT.DROPINDEX', index)
        }

        const schemaArgs = []
        Object.keys(schema).forEach((key) => {
          schemaArgs.push(key, schema[key].store)
          if (schema[key].sortable) schemaArgs.push('SORTABLE')
        })

        await redisClient.call(
          'FT.CREATE',
          index,
          'ON',
          'hash',
          'PREFIX',
          '1',
          prefix,
          'SCHEMA',
          ...schemaArgs
        )
      },

      find: async ({
        query,
        searchIndex,
        populate,
        offset = 0,
        limit = 50,
      }) => {
        const startTime = performance.now()
        try {
          let args = ['FT.SEARCH', searchIndex, query, 'LIMIT', offset, limit]
          if (populate)
            args = args.concat(['RETURN', populate.length], populate)
          console.log(`Executing search: ${args.join(' ')}`)
          const result = await redisClient.call(...args)

          const [count, ...data] = result
          const docs = data
            .filter((_, idx) => idx % 2 !== 0)
            .map((fields) =>
              fields.reduce((acc, val, idx) => {
                if (idx % 2 === 0) acc[val] = fields[idx + 1]
                return acc
              }, {})
            )

          const endTime = performance.now()
          return { count, docs, time: `${Math.trunc(endTime - startTime)}ms` }
        } catch (error) {
          console.error('Search Error:', error)
          return { error: error.message || 'Unable to execute search' }
        }
      },
    },
    key: {
      ...redisClient.key,
      scan: async ({ pattern }) => {
        let cursor = '0'
        const keys = []
        do {
          const [newCursor, foundKeys] = await redisClient.call(
            'SCAN',
            cursor,
            'MATCH',
            pattern
          )
          cursor = newCursor
          keys.push(...foundKeys)
        } while (cursor !== '0')
        return keys
      },
      set: async ({ key, data, ttl }) => {
        keyCheck(key)
        const args = [key, data]
        if (ttl) args.push('EX', ttl)
        return redisClient.set(...args)
      },
      get: async ({ key }) => {
        keyCheck(key)
        const result = await redisClient.get(key)
        return result !== 'null' ? result : null
      },
      delete: async ({ key }) => {
        keyCheck(key)
        await redisClient.del(key)
      },
    },
    hash: {
      set: async ({ key, data }) => {
        const args = [key, ...Object.entries(data).flat()]
        return redisClient.hset(...args)
      },
      get: async ({ key }) => {
        return redisClient.hgetall(key)
      },
      remove: async ({ key, fields }) => {
        return redisClient.hdel(key, ...fields)
      },
    },
  }
}
