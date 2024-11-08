import db from '../db/index.js'
import { Router } from 'express'
import accessTokenCheck from '../middleware/accessTokenCheck.js'
import tryCatchWrapper from '../util/tryCatchWrapper.js'
import CustomError from '../util/CustomError.js'

const deviceRouter = Router()

deviceRouter.use(accessTokenCheck)

deviceRouter.route('/').get(tryCatchWrapper(getAllDevices))
deviceRouter.route('/instock').get(tryCatchWrapper(getInStockDevices))
deviceRouter.route('/assign').post(tryCatchWrapper(assignDevice))
deviceRouter.route('/release').post(tryCatchWrapper(returnDevice))

async function getAllDevices(req, res, next) {
  const searchStr = req.query.q
  const query = searchStr
    ? `SELECT * FROM devices WHERE name ILIKE $1 OR model ILIKE $1`
    : `SELECT * FROM devices`
  const params = searchStr ? [`%${searchStr}%`] : []
  const { rows: data } = await db.query(query, params)
  return res.status(200).send(data)
}

async function getInStockDevices(req, res, next) {
  const { rows: data } =
    await db.query(`SELECT id, name, model FROM devices WHERE id NOT IN (
        SELECT device_id FROM entries WHERE returned_at IS NULL
      )`)
  res.status(200).send(data)
}

async function assignDevice(req, res, next) {
  const userId = req.userId
  const { deviceId, reason, status } = req.body
  if (!(await isDeviceValid(deviceId))) {
    throw new CustomError(404, 'Device not found')
  }
  if (!(await isDeviceAvailable(deviceId))) {
    throw new CustomError(400, 'Device is taken')
  }
  const { rows } = await db.query(`
      SELECT 
        (SELECT id FROM device_status WHERE value = 'OUT OF OFFICE') AS defaultStatusId,
        (SELECT id FROM entry_reason WHERE value = 'PERSONAL USE') AS defaultReasonId
    `)
  const { defaultStatusId, defaultReasonId } = rows[0]

  await db.query(
    `INSERT INTO entries (user_id, device_id, reason) VALUES ($1, $2, $3)`,
    [userId, deviceId, reason ?? defaultReasonId]
  )
  await db.query(`UPDATE devices SET status = $2 WHERE id = $1`, [
    deviceId,
    status ?? defaultStatusId,
  ])

  res.status(201).send('Device Rented')
}

async function returnDevice(req, res, next) {
  const userId = req.userId
  const { deviceId } = req.body
  const { rowCount: entryRowCount } = await db.query(
    `SELECT * FROM entries WHERE user_id = $1 AND device_id = $2 AND returned_at IS NULL`,
    [userId, deviceId]
  )
  if (entryRowCount === 0) {
    throw new CustomError(400, 'Invalid Device Id')
  }
  const { rowCount } = await db.query(
    `UPDATE entries SET returned_at = CURRENT_TIMESTAMP WHERE device_id = $1 AND user_id = $2`,
    [deviceId, userId]
  )
  if (rowCount === 0) {
    throw new CustomError(401, 'Update failed')
  }
  res.status(200).send('Device Returned')
}

async function isDeviceValid(deviceId) {
  try {
    const { rowCount } = await db.query(`SELECT * FROM devices WHERE id = $1`, [
      deviceId,
    ])
    return rowCount === 1
  } catch (err) {
    throw err
  }
}

async function isDeviceAvailable(deviceId) {
  try {
    const { rowCount } = await db.query(
      `SELECT * FROM entries WHERE device_id = $1 AND returned_at IS NULL`,
      [deviceId]
    )
    return rowCount === 0
  } catch (err) {
    throw err
  }
}

export default deviceRouter
