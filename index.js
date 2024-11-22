import express from 'express';
import setGlobalMiddlewares from './middleware/index.js';
import configureRoutes from './util/configureRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const server = express();

setGlobalMiddlewares({ server });
await configureRoutes({ server });
errorHandler(server);

export default server;
