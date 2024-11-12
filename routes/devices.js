import { Router } from 'express'
import tryCatchWrapper from '../util/tryCatchWrapper.js'
import DeviceService from '../services/device-service.js'

const deviceRouter = Router()

deviceRouter.route('/').get(tryCatchWrapper(DeviceService.getAllDevices))
deviceRouter.route('/own').get(tryCatchWrapper(DeviceService.getOwnedDevices))
deviceRouter.get('/instock', tryCatchWrapper(DeviceService.getInStockDevices))
deviceRouter.route('/assign').post(tryCatchWrapper(DeviceService.assignDevice))
deviceRouter.route('/release').post(tryCatchWrapper(DeviceService.returnDevice))

export default deviceRouter
