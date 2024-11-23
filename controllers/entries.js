import EntryService from '../services/entry-service.js';

export default new (class EntriesController {
  async getAllEntries(req, res) {
    const { user, device } = req.query;
    const data = await EntryService.getEntriesByUserOrDevice({ user, device });
    res.status(200).send(data);
  }

  async getEntriesByDate(req, res) {
    const { startDate, endDate } = req.query;
    const data = await EntryService.getEntriesByDate({ startDate, endDate });
    res.status(200).send(data);
  }
})();
