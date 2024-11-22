import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import openApiValidator from 'openapi-validator-middleware';
import EntriesController from '../controllers/entries.js';

const entriesRouter = Router();
const validatorFn = openApiValidator.validate;

entriesRouter.route('/').get(validatorFn, tryCatchWrapper(EntriesController.getAllEntries));
entriesRouter.route('/date').get(validatorFn, tryCatchWrapper(EntriesController.getEntriesByDate));

export default entriesRouter;
