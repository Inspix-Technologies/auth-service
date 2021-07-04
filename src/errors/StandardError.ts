import { Response } from 'express'

export type BaseError = Array<any>

export type ClientErrors = Array<{
  name: string;
  message: string;
}>

class StandardError extends Error {
  private readonly status: number
  private readonly code: number
  private readonly errors: BaseError

  constructor(code: number, status: number, message: string, errors: BaseError) {
    super(message)
    this.name = "StandardError"
    this.status = status
    this.code = code
    this.errors = errors
  }

  public createResponse(res: Response) {
    return res.status(this.status).json({
      status: this.status,
      name: this.name,
      message: this.message,
      code: this.code,
      errors: this.errors
    })
  }
}

export default StandardError