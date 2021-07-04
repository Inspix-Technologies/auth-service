import { RequestHandler } from "express";
import TokenError from "../errors/TokenError";
import tokenAuthenticator from "../token-authenticator";

const mustAuthorized: RequestHandler = async (req, res, next) => {
  const idToken: string | undefined = req.headers.authorization?.split(' ')[1]
  if (!idToken) 
    return TokenError
      .createClientError(1, 400, "idtoken not found", [{name: 'idToken', message: 'missing'}])
      .createResponse(res)
  const decodedToken = await tokenAuthenticator(idToken)
  if (!decodedToken) 
    return TokenError
      .createClientError(2, 403, "unauthorized", [{name: 'idToken', message: 'unauthorized'}])
      .createResponse(res)
  req.decodedIdToken = decodedToken
  next()
}

export default mustAuthorized