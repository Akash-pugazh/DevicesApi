import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import EntryService from '../services/entry-service.js';

const entriesRouter = Router();

entriesRouter.route('/').get(tryCatchWrapper(EntryService.getAllEntries));
entriesRouter.route('/date').get(tryCatchWrapper(EntryService.getEntriesByDate));

export default entriesRouter;
