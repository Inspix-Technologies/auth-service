import StandardError, { BaseError, ClientErrors } from './StandardError'

class TokenError extends StandardError {

  constructor(code: number, status: number, message: string, errors: BaseError) {
    super(code, status, message, errors)
    this.name = "TokenError"
  }

  public static createClientError(code: number, status: number, message: string, errors: ClientErrors) {
    return new TokenError(code, status, message, errors)
  }
}

export default TokenError