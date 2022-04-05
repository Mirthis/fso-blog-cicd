require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./server/modules/person')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :type')
)
app.use(cors())
app.use(express.static('dist'))

morgan.token('type', function (req) {
  const data = req.body
  return JSON.stringify(data)
})

app.get('/ping', (req, res) => {
  res.send('pong') // change this string to ensure a new version deployed
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response, next) => {
  Person.estimatedDocumentCount()
    .then(count => {
      const info_msg = `<div>Phonebook has info for ${count} people</div><di>${new Date()}</div>`
      response.send(info_msg)
    })
    .catch(error => {
      next(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(result => {
      if (result) {
        response.json(result)
      } else {
        createErrorResponse(
          response,
          `Person with id ${id} not found`,
          404
        ).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const data = request.body
  if (!data) {
    return createErrorResponse(response, 'no data received')
  }

  if (data.name) {
    Person.find({ name: data.name }).then(result => {
      if (result.length > 0) {
        console.log('duplicate found!')
        return createErrorResponse(
          response,
          'A person with the given name already exist'
        ).end()
      }
      const person = new Person({
        name: data.name,
        number: data.number,
      })
      //console.log(person);
      person
        .save()
        .then(result => response.json(result))
        .catch(err => next(err))
    })
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const data = request.body
  const person = {
    name: data.name,
    number: data.number,
  }
  Person.findByIdAndUpdate(id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then(updatedPerson => {
      if (updatedPerson) response.json(updatedPerson)
      else {
        return createErrorResponse(
          response,
          `Person with id ${id} not found`,
          404
        ).end()
      }
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndRemove(id)
    .then(result => {
      if (result) response.status(204).end()
      else {
        return createErrorResponse(
          response,
          `Person with id ${id} not found`,
          404
        ).end()
      }
    })
    .catch(err => next(err))
})

const createErrorResponse = (response, error, status = 400) => {
  return response.status(status).json({ error })
}

const extractValidationMessage = error => {
  return Object.values(error.errors)
    .map(e => e.message)
    .join('. ')
}

const unknownEndpoint = (request, response) => {
  createErrorResponse(response, 'unknown endpoint', 404)
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error)

  if (error.name === 'CastError') {
    return createErrorResponse(response, 'malformed id', 404).end()
  }
  if (error.name === 'ValidationError') {
    return createErrorResponse(
      response,
      extractValidationMessage(error),
      404
    ).end()
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
