import { Router } from 'express'
import { configureDocRoute } from '../docs/index.js'
const router = Router()

export class RouterEndPoint {
  constructor(route, router) {
    this.route = route
    this.router = router
  }
}

export default function configureRoutes({ server, routers }) {
  // Doc route
  configureDocRoute(server)
  // Other routes
  routers.forEach(ep => {
    server.use(ep.route, ep.router)
  })
}
