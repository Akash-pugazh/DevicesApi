import swaggerUi from 'swagger-ui-express';
import fs from 'fs/promises';
import { Router } from 'express';
import { Config } from '../../config.js';

const docsRouter = Router();

fs.readFile(Config.OPEN_API_PATH, { encoding: 'utf-8' }).then(data => {
  docsRouter.use(swaggerUi.serve, swaggerUi.setup(JSON.parse(data)));
});

export default docsRouter;
