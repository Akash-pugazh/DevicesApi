import express from 'express'
import session from 'express-session'
import configureRoutes, { RouterEndPoint } from './routes/index.js'
import usersRouter from './routes/users.js'
import devicesRouter from './routes/devices.js'
import entriesRouter from './routes/entries.js'
import authRouter from './routes/auth.js'
import cookieParser from 'cookie-parser'

const server = express()

server.use(express.json())
server.use(cookieParser())
server.use(
  session({
    secret: 'PASSWORD',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 300000,
    },
  })
)

configureRoutes(
  server,
  new Array(
    new RouterEndPoint('/auth', authRouter),
    new RouterEndPoint('/users', usersRouter),
    new RouterEndPoint('/devices', devicesRouter),
    new RouterEndPoint('/entries', entriesRouter)
  )
)

server.use((err, req, res, next) => {
  res.status(400).send(err.message)
})

export default server
