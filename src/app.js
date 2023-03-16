const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const path = require('path')
const hpp = require('hpp')
const { Server } = require('socket.io')

const userRouter = require('./routers/userRouter')
const indexRoutes = require('./routers/indexRoutes')
const messageRouter = require('./routers/messageRouter')
const channelRoutes = require('./routers/channelRoutes')

const globalErrorHandler = require('./middlewares/globalErrorHandler')

const AppError = require('./utils/appError')
const http = require('http')
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})

global.io = io

// view engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json())

// set security http headers
app.use(helmet())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// $ CORS
app.use(cors())

//  set limit request from same API in timePeriod from same ip
const limiter = rateLimit({
  max: 1000, //   max number of limits
  windowMs: 60 * 1000, // hour
  message: 'Too many req from this IP , please Try  again in an Hour!',
})

app.use('/api', limiter)

// Body Parser => reading data from body into req.body protect from scraping etc
app.use(express.json({ limit: '10kb' }))

// Data sanitization against NoSql query injection
app.use(mongoSanitize()) // filter out the dollar signs protect from  query injection attract

// Data sanitization against XSS
app.use(xss()) // protect from malicious code coming from html

// testing middleware
app.use((req, res, next) => {
  console.log('this is a middleware')
  next()
})

// routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1', indexRoutes)
app.use('/api/v1', messageRouter)
app.use('/api/v1', channelRoutes)

app.get('/', (req, res) => res.send({ success: 'Everything is working fine!' }))

// handling all (get,post,update,delete.....) unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
})

// error handling middleware
app.use(globalErrorHandler)

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id)
  })
})

module.exports = { app, server }
