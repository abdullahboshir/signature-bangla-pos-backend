
import { type Response, type Request } from 'express'
import status from 'http-status'

const notFound = (req: Request, res: Response) => {
  return res.status(status.NOT_FOUND).json({
    sucess: false,
     message: `Route ${req.originalUrl} not found!`,
    error: '',
  })
}

export default notFound
