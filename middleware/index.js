import express from 'express'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import tryCatchWrapper from '../util/tryCatchWrapper.js'
import accessTokenCheck from './accessTokenCheck.js'
import { Config } from '../config.js'
import swaggerValidation from 'openapi-validator-middleware'

export default function setGlobalMiddlewares({ server }) {
  swaggerValidation.init(Config.OPEN_API_PATH, {
    beautifyErrors: true,
    framework: 'express',
  })
  server.use(express.json())
  server.use(cookieParser())
  server.use(
    session({
      secret: Config.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 300000,
      },
    })
  )
  server.use(tryCatchWrapper(accessTokenCheck))
}
