import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import sequelize from './database/Database';
import User, { UserAttributes, UserCreationAttributes } from './UserModel';
import { auth } from 'firebase-admin';
import mustAuthorized from './middlewares/auth-middleware';
import EndUserError from './errors/EndUserError';
import TokenError from './errors/TokenError';
import tokenAuthenticator from './token-authenticator';
import AuthError from './errors/AuthError';
import { validateObjectAttributes } from './utils/ObjectHelper';
import billingRouter from './services/billing-service';
import predictRouter from './services/predict-service';
import apiKeyRouter from './services/apikey-service';
import axios from 'axios';

declare global {
  namespace Express {
    interface Request {
      decodedIdToken: auth.DecodedIdToken;
    }
  }
}

const app = express();
sequelize.addModels([User]);
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.get('/', async (req, res) => {
  const idToken: string | undefined = req.headers.authorization?.split(' ')[1];
  console.log('hi');
  if (!idToken)
    return TokenError.createClientError(1, 400, 'idtoken not found', [
      { name: 'idToken', message: 'missing' },
    ]).createResponse(res);
  const decodedToken = await tokenAuthenticator(idToken);
  if (!decodedToken)
    return TokenError.createClientError(2, 403, 'unauthorized', [
      { name: 'idToken', message: 'unauthorized' },
    ]).createResponse(res);

  const userDataPromise = new Promise<UserAttributes>(
    async (resolve, reject) => {
      try {
        const user = await User.findOne({ where: { uid: decodedToken.uid } });
        if (!user)
          return new AuthError(4, 403, 'user data missing', [
            { name: 'userData', message: 'missing' },
          ]).createResponse(res);
        const jsoned = user.toJSON() as UserAttributes;
        resolve(jsoned);
      } catch (e) {
        console.error(e);
        return new AuthError(4, 403, 'user data missing', [
          { name: 'userData', message: 'missing' },
        ]).createResponse(res);
      }
    }
  );

  const userFundsPromise = new Promise<{ funds: number }>(
    async (resolve, reject) => {
      try {
        //TODO: fix this bad request
        //propose: console.log on /funds?uid=
        const funds = await axios.get(
          `${process.env.BILLING_SERVICE_ADDRESS!}/funds?uid=${
            decodedToken.uid
          }`
        );
        resolve(funds.data);
      } catch (e) {
        console.error(e.response);
        return new AuthError(4, 403, 'funds error', [
          { name: 'userFunds', message: 'missing' },
        ]).createResponse(res);
      }
    }
  );

  Promise.all([userDataPromise, userFundsPromise])
    .then(([userData, userFunds]) => {
      const user = { ...userData, ...userFunds };
      res.status(200).json(user);
    })
    .catch(() => {
      res.status(500).json({ message: 'promise error' });
    });
});

app.post('/', mustAuthorized, async (req, res) => {
  const reqBody = req.body as UserCreationAttributes;

  try {
    const validationResult = validateObjectAttributes(
      ['name', 'businessName', 'businessType', 'phoneNumber'],
      reqBody
    );
    if (validationResult.length > 0)
      return new EndUserError(
        3,
        422,
        'incomplete request body',
        validationResult.map((val) => ({ name: val, message: 'missing' }))
      ).createResponse(res);
  } catch (e) {
    console.error(e);
    return new EndUserError(3, 422, 'request body empty', [
      { name: 'requestbody', message: `missing` },
    ]).createResponse(res);
  }
  const decodedIdToken = req.decodedIdToken;
  const user = await User.create({
    uid: decodedIdToken.uid,
    name: reqBody.name,
    businessName: reqBody.businessName,
    businessType: reqBody.businessType,
    phoneNumber: reqBody.phoneNumber,
    email: decodedIdToken.email!,
    isVerified: false,
  });

  try {
    await axios.post(`${process.env.BILLING_SERVICE_ADDRESS!}/funds/init`, {
      userUid: decodedIdToken.uid,
    });
  } catch (e) {
    console.error(e);
    // res.status(500).json({message: 'something is wrong with database operation'});
  }

  res.status(201).json(user.toJSON());
});

app.use('/billing', billingRouter);
app.use('/predict', predictRouter);
app.use('/apikey', apiKeyRouter);

export default app;
