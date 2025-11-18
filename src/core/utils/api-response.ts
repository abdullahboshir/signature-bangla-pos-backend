import {type Response } from 'express'


export interface MetaData {
    total: number
    page?: number
    limit?: number
  }
 type TResponse<T> = {
  statusCode: number
  success: boolean
  message?: string
  data: T
  meta?: MetaData
}

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data || null || undefined,
    meta: data.meta || null || undefined, 
  })
}

export default sendResponse
