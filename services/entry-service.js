import EntryRepository from '../repository/entry-repository.js';

export class EntryService {
  insertEntry = async ({ user_id, device_id, reason }) => {
    return await EntryRepository.insertEntry({
      user_id,
      device_id,
      reason
    });
  };

  updateEntryReturnedAt = async ({ user_id, device_id }) => {
    return await EntryRepository.updateEntryReturnedAt({
      user_id,
      device_id
    });
  };

  getEntriesByUserOrDevice = async ({ user, device }) => {
    return await EntryRepository.fetchAllEntries({
      username: user,
      devicename: device
    }).then(data => data.build());
  };

  getEntriesByDate = async ({ startDate, endDate }) => {
    return await EntryRepository.fetchEntriesByDate({
      startDate,
      endDate
    }).then(data => data.build());
  };
}

export default new EntryService();
