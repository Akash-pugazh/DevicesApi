import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import EntryService from '../services/entry-service.js';
import openApiValidator from 'openapi-validator-middleware';

const entriesRouter = Router();
const validatorFn = openApiValidator.validate;

entriesRouter.route('/').get(validatorFn, tryCatchWrapper(EntryService.getAllEntries));
entriesRouter.route('/date').get(validatorFn, tryCatchWrapper(EntryService.getEntriesByDate));

export default entriesRouter;
