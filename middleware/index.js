import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import accessTokenCheck from './accessTokenCheck.js';
import { Config } from '../config.js';
import openApiValidator from 'openapi-validator-middleware';
import Log from '../util/Log.js';

export default function setGlobalMiddlewares({ server }) {
  openApiValidator.init(Config.OPEN_API_PATH, {
    beautifyErrors: true,
    framework: 'express'
  });
  server.use(express.json());
  server.use(cookieParser());
  server.use(
    session({
      secret: Config.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 300000
      }
    })
  );
  // server.use(Log.reqLogMiddleware());
  server.use(tryCatchWrapper(accessTokenCheck));
}
