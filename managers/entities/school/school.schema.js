module.exports = {
  createSchool: [
    {
      model: 'name',
      path: 'name',
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 100,
    },
    {
      model: 'address',
      path: 'address',
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 200,
    },
  ],

  updateSchool: [
    {
      model: 'name',
      required: false,
      type: 'string',
      minLength: 3,
      maxLength: 100,
    },
    {
      model: 'address',
      required: false,
      type: 'string',
      minLength: 10,
      maxLength: 200,
    },
  ],
}
