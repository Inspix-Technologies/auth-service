import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import sequelize from './database/Database';
import User from './UserModel';
import { auth } from 'firebase-admin';
import mustAuthorized from './middlewares/auth-middleware';
import EndUserError from './errors/EndUserError';

declare global {
  namespace Express {
    interface Request {
      decodedIdToken: auth.DecodedIdToken
    }
  }
}

const app = express();
sequelize.addModels([User]);
app.use(cors());
app.use(express.json());

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
