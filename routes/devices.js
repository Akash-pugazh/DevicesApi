import { Router } from 'express'
import db from '../db/index.js'
import accessTokenCheck from '../middleware/accessTokenCheck.js'

const deviceRouter = Router()

// deviceRouter.use(checkUserSessionMiddleware)

deviceRouter.use(accessTokenCheck)
deviceRouter.get('/', getAllDevices)
deviceRouter.route('/instock').get(getInStockDevices)
deviceRouter.route('/rent').post(rentDevice)
deviceRouter.route('/return').post(returnDevice)

async function getAllDevices(req, res, next) {
  try {
    // Default search results
    if (!Object.keys(req.query).length >= 1) {
      const response = await db
        .query(`SELECT * FROM devices`)
        .then(data => data.rows)
      return res.status(200).send(response)
    }

    // Handle search string
    if (req.query.q.length >= 1) {
      const searchStr = req.query.q
      const dbRes = await db.query(
        `SELECT * FROM devices WHERE name ILIKE $1 OR MODEL ILIKE $1`,
        [`%${searchStr}%`]
      )
      dbRes.rowCount >= 1
        ? res.status(200).send(dbRes.rows)
        : res.status(404).send('No Data Found')
      return
    }
  } catch (err) {
    next(err)
  }
}

async function getInStockDevices(req, res, next) {
  try {
    const dbRes = await db.query(`
      SELECT id, name, model FROM devices WHERE id NOT IN (
        SELECT device_id FROM entries WHERE returned_at IS NULL
      )`)
    res.status(200).send(dbRes.rows)
  } catch (err) {
    next(err)
  }
}

async function rentDevice(req, res, next) {
  try {
    const userId = req.session.user.id
    const { deviceId, reason, status } = req.body
    if (!(await checkValidDevice(deviceId))) {
      res.status(404).send('Device not found')
    }
    if (!(await isDeviceTaken(deviceId))) {
      res.status(400).send('Device is taken')
    }

    const defaultRentingDeviceStatus = await db.query(
      `SELECT id FROM device_status WHERE value = $1`,
      ['OUT OF OFFICE']
    )

    const defaultRentingDeviceReason = await db.query(
      `SELECT id FROM entry_reason WHERE value = $1`,
      ['PERSONAL USE']
    )

    const insertDbResponse = await db.query(
      `INSERT INTO entries (user_id, device_id, reason) VALUES ($1, $2, $3)`,
      [userId, deviceId, reason ?? defaultRentingDeviceReason.rows[0].id]
    )
    await db.query(`UPDATE devices SET status = $1 WHERE id = $2`, [
      status ?? defaultRentingDeviceStatus.rows[0].id,
      deviceId,
    ])

    if (insertDbResponse.rowCount === 1) {
      res.status(201).send('Device Rented')
    } else {
      res.status(400).send('Unable to rent device')
    }
  } catch (err) {
    next(err)
  }
}

async function returnDevice(req, res, next) {
  try {
    const userId = req.session.user.id
    console.log(userId)
    const { deviceId } = req.body

    const dbRes = await db.query(
      `UPDATE entries SET returned_at = CURRENT_TIMESTAMP WHERE device_id = $1 AND user_id = $2`,
      [deviceId, userId]
    )
    console.log(dbRes.rows)
    if (dbRes.rowCount === 1) res.status(200).send('Device Returned')
  } catch (err) {
    next(err)
  }
}

async function checkValidDevice(deviceId) {
  try {
    const dbRes = await db.query(`SELECT * FROM devices WHERE id = $1`, [
      deviceId,
    ])
    if (dbRes.rowCount === 1) return true
  } catch (err) {
    throw err
  }
  return false
}

async function isDeviceTaken(deviceId) {
  try {
    const dbRes = await db.query(
      `SELECT * FROM entries WHERE device_id = $1 AND returned_at IS NULL`,
      [deviceId]
    )
    if (dbRes.rowCount === 0) return false
  } catch (err) {
    throw err
  }
  return true
}

function checkUserSessionMiddleware(req, res, next) {
  if (!req.session.user) throw new Error('Please Login')
  next()
}

export default deviceRouter
