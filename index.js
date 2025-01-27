const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(express.static('dist'))

app.use(cors())


morgan.token('body', (req, res) => { return req.body })
const customLog = 
morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.method(req, res) === 'POST'
      ? JSON.stringify(tokens['body'](req, res))
      : null
  ].join(' ')
})
app.use(customLog)


let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]


app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

app.get('/info', (request, response) => {
  var now = new Date()
  console.log(now.toString())
  response.send(
    `<div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${now.toString()}</p>
    </div>`
  )
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if(person) {
    response.json(person)
  } else {
    response.statusMessage = `Person with id ${id} does not exist`
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  
  response.status(204).end()
})


const generateNewId = () => {
  return Math.ceil(Math.random() * 1000) + persons.length
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if(!body.name) {
    return response.status(404).json({
      error: 'Name missing'
    })
  }
  if(!body.number) {
    return response.status(404).json({
      error: 'Number missing'
    })
  }
  
  const existingPerson = persons.find(p => p.name === body.name)
  if(existingPerson) {
    return response.status(404).json({
      error: 'Name must be unique'
    })
  }

  const person = {
    "id": String(generateNewId()),
    "name": body.name,
    "number": body.number
  }

  persons = persons.concat(person)

  response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
