import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import sequelize from './database/Database';
import User from './UserModel';
import { auth } from 'firebase-admin';
import mustAuthorized from './middlewares/auth-middleware';
import EndUserError from './errors/EndUserError';
import TokenError from './errors/TokenError';
import tokenAuthenticator from './token-authenticator';
import AuthError from './errors/AuthError';

declare global {
  namespace Express {
    interface Request {
      decodedIdToken: auth.DecodedIdToken
    }
  }
}

const app = express();
sequelize.addModels([User]);
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(express.json());

app.get("/", async (req, res) => {
  const idToken: string | undefined = req.headers.authorization?.split(' ')[1]
  console.log('hi')
  if (!idToken) 
    return TokenError
      .createClientError(1, 400, "idtoken not found", [{name: 'idToken', message: 'missing'}])
      .createResponse(res)
  const decodedToken = await tokenAuthenticator(idToken)
  if (!decodedToken) 
    return TokenError
      .createClientError(2, 403, "unauthorized", [{name: 'idToken', message: 'unauthorized'}])
      .createResponse(res)
  const user = await User.findOne({where: {uid: decodedToken.uid}})
  if (!user)
    return new AuthError(4, 403, "user data missing", [{name: 'userData', message: 'missing'}])
      .createResponse(res)
  
  res.status(200).json(user.toJSON())
})

//TODO: make this reusable on other services for validation?
app.post("/", mustAuthorized, async (req, res, next) => {
  let name: string | undefined;

  try {
    name = req.body['name']
    if (!name) throw "name missing"
   } catch (e) {
     console.error(e)
     return new EndUserError(3, 422, "name not found", [{name: "name", message: `missing (found ${name}`}]).createResponse(res)
   }
  const decodedIdToken = req.decodedIdToken
  User.create({
    uid: decodedIdToken.uid,
    name: name,
    email: decodedIdToken.email!,
    isVerified: decodedIdToken.email_verified? true : false
  })
  res.status(201).json("success")
})


export default app;
