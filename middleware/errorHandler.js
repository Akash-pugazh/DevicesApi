import CustomError from '../util/CustomError.js'

export default function errorHandler(server) {
  server.use((err, req, res, next) => {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message })
    }
    res.status(500).send({ message: err.message })
  })
}
