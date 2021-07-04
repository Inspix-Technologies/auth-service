import StandardError, { ClientErrors } from './StandardError'

class AuthError extends StandardError {

  constructor(code: number, status: number, message: string, errors: ClientErrors) {
    super(code, status, message, errors)
    this.name = "AuthError"
  }
}

export default AuthError