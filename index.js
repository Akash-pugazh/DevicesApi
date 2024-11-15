import express, { Router } from 'express'
import usersRouter from './routes/users.js'
import devicesRouter from './routes/devices.js'
import entriesRouter from './routes/entries.js'
import authRouter from './routes/auth.js'
import configureRoutes, { RouterEndPoint } from './util/configureRoutes.js'
import errorHandler from './middleware/errorHandler.js'
import setGlobalMiddlewares from './middleware/index.js'

const server = express()

setGlobalMiddlewares({ server })

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
