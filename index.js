import express from 'express'
import session from 'express-session'
import usersRouter from './routes/users.js'
import devicesRouter from './routes/devices.js'
import entriesRouter from './routes/entries.js'
import authRouter from './routes/auth.js'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import configureRoutes, { RouterEndPoint } from './util/configureRoutes.js'
import errorHandler from './middleware/errorHandler.js'
import tryCatchWrapper from './util/tryCatchWrapper.js'
import accessTokenCheck from './middleware/accessTokenCheck.js'

config()

const server = express()

server.use(express.json())
server.use(cookieParser())
server.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 300000,
    },
  })
)
server.use(tryCatchWrapper(accessTokenCheck))

configureRoutes({
  server: server,
  routers: [
    new RouterEndPoint('/auth', authRouter),
    new RouterEndPoint('/users', usersRouter),
    new RouterEndPoint('/devices', devicesRouter),
    new RouterEndPoint('/entries', entriesRouter),
  ],
})

errorHandler(server)

export default server
