import EntryRepository from '../repository/entry-repository.js'

export default new (class EntryService {
  async getAllEntries(req, res) {
    const { user, device } = req.query
    const { rows } = await EntryRepository.fetchAllEntries({
      username: user,
      devicename: device,
    })
    res.status(200).send(rows)
  }

  async getEntriesByDate(req, res) {
    const { startDate, endDate } = req.query
    const { rows } = await EntryRepository.fetchEntriesByDate({
      startDate,
      endDate,
    })
    res.status(200).send(rows)
  }
})()
