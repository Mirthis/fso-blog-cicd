const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

console.log('connecting to Mongo DB...')

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'Name must be at least 3 characters long.'],
    required: [true, 'Name is required.'],
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!
      Numbers should be formed of two parts separated by -, the first part has two or three numbers and the second part has one ore more numbers`,
    },
    required: [true, 'Phone number is required.'],
    minlength: [8, 'Number must be at least 8 characters long.'],
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
