module.exports = {
  create: [
    {
      model: 'schoolId',
      required: true,
      type: 'string',
    },
    {
      model: 'name',
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 100,
    },
    {
      model: 'capacity',
      required: true,
      type: 'number',
      min: 1,
      max: 500,
    },
    {
      model: 'resources',
      required: false,
      type: 'object',
    },
  ],

  update: [
    {
      model: 'name',
      required: false,
      type: 'string',
      minLength: 3,
      maxLength: 100,
    },
    {
      model: 'capacity',
      required: false,
      type: 'number',
      min: 1,
      max: 500,
    },
    {
      model: 'resources',
      required: false,
      type: 'object',
    },
  ],

  list: [
    {
      model: 'schoolId',
      required: true,
      type: 'string',
    },
  ],
}
