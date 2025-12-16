
import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import status from 'http-status'
import appConfig from '../../shared/config/app.config.js'
import AppError from '../../shared/errors/app-error.js'

// Type definitions for error sources
type TErrorSource = {
  path: string | number
  message: string
}

type TErrorResponse = {
  statusCode: number | string
  message: string
  errorSources: TErrorSource[]
}

// Handle Mongoose Validation Error
const handleValidationError = (err: any): TErrorResponse => {
  const errorSources: TErrorSource[] = Object.values(err.errors).map(
    (val: any) => ({
      path: val?.path || '',
      message: val?.message || 'Validation error',
    })
  )

  return {
    statusCode: status.BAD_REQUEST,
    message: 'Validation Error',
    errorSources,
  }
}

// Handle Mongoose Cast Error (Invalid ObjectId)
const handleCastError = (err: any): TErrorResponse => {
  const errorSources: TErrorSource[] = [
    {
      path: err.path || '',
      message: `Invalid ${err.path}: ${err.value}`,
    },
  ]

  return {
    statusCode: status.BAD_REQUEST,
    message: 'Invalid ID',
    errorSources,
  }
}

// Handle Mongoose Duplicate Key Error (11000)
const handleDuplicateError = (err: any): TErrorResponse => {
  const match = err.message.match(/"([^"]*)"/)
  const extractedMessage = match && match[1]

  const errorSources: TErrorSource[] = [
    {
      path: Object.keys(err.keyValue)[0] || '',
      message: `${extractedMessage} already exists`,
    },
  ]

  return {
    statusCode: status.CONFLICT,
    message: 'Duplicate Entry',
    errorSources,
  }
}

// Handle Zod Validation Error
const handleZodError = (err: ZodError): TErrorResponse => {
  const errorSources: TErrorSource[] = err.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

  return {
    statusCode: status.BAD_REQUEST,
    message: 'Validation Error',
    errorSources,
  }
}

// Handle JWT Errors
const handleJWTError = (): TErrorResponse => {
  return {
    statusCode: status.UNAUTHORIZED,
    message: 'Invalid token. Please login again.',
    errorSources: [
      {
        path: '',
        message: 'Invalid authentication token',
      },
    ],
  }
}

const handleJWTExpiredError = (): TErrorResponse => {
  return {
    statusCode: status.UNAUTHORIZED,
    message: 'Token expired. Please login again.',
    errorSources: [
      {
        path: '',
        message: 'Authentication token has expired',
      },
    ],
  }
}

// Main Global Error Handler
const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode: number | string = status.INTERNAL_SERVER_ERROR
  let message = 'Something went wrong!'
  let errorSources: TErrorSource[] = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ]

  // Log error in development
  if (appConfig.NODE_ENV === 'development') {
    console.error('🔴 Error:', err)
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const simplified = handleValidationError(err)
    statusCode = simplified.statusCode
    message = simplified.message
    errorSources = simplified.errorSources
  }
  // Mongoose Cast Error
  else if (err.name === 'CastError') {
    const simplified = handleCastError(err)
    statusCode = simplified.statusCode
    message = simplified.message
    errorSources = simplified.errorSources
  }
  // Mongoose Duplicate Key Error (11000)
  else if (err.code === 11000) {
    const simplified = handleDuplicateError(err)
    statusCode = simplified.statusCode
    message = simplified.message
    errorSources = simplified.errorSources
  }
  // Zod Validation Error
  else if (err instanceof ZodError) {
    const simplified = handleZodError(err)
    statusCode = simplified.statusCode
    message = simplified.message
    errorSources = simplified.errorSources
  }
  // JWT Error
  else if (err.name === 'JsonWebTokenError') {
    const simplified = handleJWTError()
    statusCode = simplified.statusCode
    message = simplified.message
    errorSources = simplified.errorSources
  }
  // JWT Expired Error
  else if (err.name === 'TokenExpiredError') {
    const simplified = handleJWTExpiredError()
    statusCode = simplified.statusCode
    message = simplified.message
    errorSources = simplified.errorSources
  }
  // Custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ]
  }
  // Custom AppError (Duck Typing fallback)
  else if (err.statusCode && typeof err.statusCode === 'number') {
    statusCode = err.statusCode
    message = err.message
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ]
  }
  // Generic Error
  else if (err instanceof Error) {
    message = err.message
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ]
  }

  // Send Response
  res.status(statusCode as number).json({
    success: false,
    message,
    errorSources,
    ...(appConfig.NODE_ENV === 'development' && {
      error: err,
      stack: err?.stack,
    }),
  })
}

export default globalErrorHandler
