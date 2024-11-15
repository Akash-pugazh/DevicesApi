import swaggerUi from 'swagger-ui-express'
import doc from './openapi.json' with { type: "json" }

export function configureDocRoute(server) {
  server.use('/docs', swaggerUi.serve, swaggerUi.setup(doc))
}
