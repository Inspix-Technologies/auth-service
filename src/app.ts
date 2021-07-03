import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import sequelize from './database/Database';
import User from './UserModel';
import tokenAuthenticator from './token-authenticator';

const app = express();
sequelize.addModels([User]);
app.use(cors());
app.use(express.json());

app.post("/", async (req, res, next) => {
  const idToken: string = req.body.idToken
  const name: string = req.body.name
  if (!idToken) return res.status(400).json('idToken not found')
  if (!name) return res.status(400).json('name not found')
  const decodedToken = await tokenAuthenticator(idToken)
  if (!decodedToken) return res.status(403).json('token unauthorized')
  User.create({
    uid: decodedToken.uid,
    name: name,
    email: decodedToken.email!,
    isVerified: decodedToken.email_verified? true : false
  })
  res.status(201).json("success")
})


export default app;
