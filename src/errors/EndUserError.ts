import StandardError, { ClientErrors } from './StandardError'

class EndUserError extends StandardError {

  constructor(code: number, status: number, message: string, errors: ClientErrors) {
    super(code, status, message, errors)
    this.name = "EndUserError"
  }
}

export default EndUserError