const loader = require('./_common/fileLoader')

/**
 * load any file that match the pattern of function file and require them
 * @return an array of the required functions
 */
module.exports = class ValidatorsLoader {
  constructor() {}

  load() {
    const validators = {}

    /**
     * load schemes
     */
    const schemes = loader('./managers/**/*.schema.js')

    Object.keys(schemes).forEach((sk) => {
      validators[sk] = {}
      Object.keys(schemes[sk]).forEach((s) => {
        // Validate data using Joi schema
        validators[sk][s] = async (data) => {
          const schema = schemes[sk][s]
          try {
            const value = await schema.validateAsync(data)
            return value
          } catch (error) {
            throw error
          }
        }

        validators[sk][`${s}Trimmer`] = async (data) => {
          const schema = schemes[sk][s]
          try {
            const trimmedData = await schema.validateAsync(data, {
              stripUnknown: true,
            })
            return trimmedData
          } catch (error) {
            throw error
          }
        }
      })
    })

    return validators
  }
}
