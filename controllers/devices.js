export class DevicesController {
  async getDevices(req, res) {
    let query = req.query.q;
    const searchQuery = `%${query}%`;
    const data = query
      ? await DeviceRepository.fetchByNameOrModel({ searchQuery }).then(data => data.build())
      : await DeviceRepository.fetchAllDevices().then(data => data.build());

    return res.status(200).send(data);
  }
}

export default new DevicesController();
