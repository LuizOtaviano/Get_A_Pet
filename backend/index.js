require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
const cors = require('cors')
const userRoutes = require('./routes/userRotes.js')
const petRoutes = require('./routes/petsRoutes.js')

// JSON response
app.use(express.json())

// Solve CORS
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))

// static files
app.use(express.static('public'))

// Routes
app.use('/users', userRoutes)
app.use('/pets', petRoutes)

// Server
app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})