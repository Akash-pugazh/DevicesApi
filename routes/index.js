import { Router } from 'express'
const router = Router()

export class RouterEndPoint {
  constructor(route, router) {
    this.route = route
    this.router = router
  }
}

export default function configureRoutes(server, config) {
  config.forEach(ep => {
    server.use(ep.route, ep.router)
  })
}
