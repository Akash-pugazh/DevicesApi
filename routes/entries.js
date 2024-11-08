import { Router } from 'express'
import db from '../db/index.js'
import customErrorTryCatchHandler from '../util/customErrorTryCatchHandler.js'

const baseQuery = `
    SELECT 
        e.id id,
        u.id user_id,
        u.name user_name,
        d.id device_id,
        d.name device_name,
        s.value device_status,
        e.rented_at,
        e.returned_at,
        er.value reason
    FROM entries e 
    JOIN users u ON u.id = e.user_id 
    JOIN devices d ON d.id = e.device_id
    JOIN entry_reason er ON er.id = e.reason
    JOIN device_status s ON s.id = d.status
    `

const entriesRouter = Router()

entriesRouter.route('/').get(customErrorTryCatchHandler(getAllEntries))
entriesRouter.route('/date').get(customErrorTryCatchHandler(filterByTime))

async function getAllEntries(req, res) {
  const { user, device } = req.query
  let query = baseQuery
  let values = []
  if (user) {
    query += 'WHERE u.name ILIKE $1'
    values.push(`%${user}%`)
  } else if (device) {
    query += 'WHERE d.name ILIKE $1'
    values.push(`%${device}%`)
  }
  const dbRes = await db.query(query, values)
  res.status(200).send(dbRes.rows)
}

async function filterByTime(req, res) {
  const { startDate, endDate } = req.query
  let query = baseQuery
  let values = []
  if (startDate && endDate) {
    query += 'WHERE d.rented_at BETWEEN $1 AND $2 ORDER BY rented_at DESC'
    values.push(startDate, endDate)
  } else if (startDate) {
    query += 'WHERE d.rented_at >= $1 ORDER BY rented_at DESC'
    values.push(startDate)
  } else if (endDate) {
    query += 'WHERE d.rented_at <= $1 ORDER BY rented_at DESC'
    values.push(endDate)
  } else {
    query += 'ORDER BY rented_at DESC'
  }
  console.log(query)

  const dbRes = await db.query(query, values)
  res.status(200).send(dbRes.rows)
}

export default entriesRouter
