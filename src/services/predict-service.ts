import axios from 'axios';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const predictRouter = Router();

predictRouter.post('/', async (req, res) => {
  const base64image = req.body['base64image'];

  if (!base64image)
    return res.status(404).json({ message: 'base64image missing' });

  const apiKey = req.headers['inspix-api-key'];
  if (!apiKey) return res.status(404).json({ message: 'api key missing' });

  try {
    const tempRes = await axios.get(
      `${process.env.BILLING_SERVICE_ADDRESS!}/apikey/status?apikey=${apiKey}`
    );
    if (tempRes.data.isValid === false)
      return res.status(400).json({ message: 'unauthorized' });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }

  let decryptedKey: { userUid: string };
  try {
    decryptedKey = jwt.verify(
      apiKey as string,
      process.env.API_KEY_SECRET!
    ) as { userUid: string };
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'failed on decrypting apikey' });
  }

  let funds: { userUid: string; funds: number };
  try {
    const fundsReq = await axios.get(
      `${process.env.BILLING_SERVICE_ADDRESS!}/funds?uid=${
        decryptedKey.userUid
      }`
    );
    funds = fundsReq.data;
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }

  if (funds.funds - 10 < 0)
    return res.status(400).json({ message: 'insufficient funds' });

  let response;
  try {
    const tempRes = await axios.post(
      `${process.env.PREDICT_SERVICE_ADDRESS!}/inspix-models/test`,
      {
        base64image: base64image,
      }
    );
    response = tempRes.data;
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
  try {
    await axios.put(`${process.env.BILLING_SERVICE_ADDRESS!}/funds/purchase`, {
      userUid: funds.userUid,
      amount: 10,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }

  res.status(200).json(response);
});

export default predictRouter;
