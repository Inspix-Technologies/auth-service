import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { Router } from 'express';
import mustAuthorized from '../middlewares/auth-middleware';
import User from '../UserModel';
const billingRouter = Router();

const proxyMiddleware = createProxyMiddleware({
  target: process.env.BILLING_SERVICE_ADDRESS!,
  pathRewrite: () => '/funds/request',
  onProxyReq: fixRequestBody,
});

const afterPaymentProxy = createProxyMiddleware({
  target: process.env.BILLING_SERVICE_ADDRESS!,
  pathRewrite: () => '/funds',
  onProxyReq: fixRequestBody,
});

const getProxy = createProxyMiddleware({
  target: `${process.env.BILLING_SERVICE_ADDRESS!}`,
  onProxyReq: fixRequestBody,
  pathRewrite: {
    '/billing': '/funds',
  },
});

billingRouter.post(
  '/request',
  mustAuthorized,
  async (req, res, next) => {
    const { uid } = req.decodedIdToken;
    let user;
    try {
      user = await User.findOne({ where: { uid: uid } });
      if (user === null) {
        return res.status(404).json({
          error: 'user-404',
          message: 'user data missing',
        });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        error: 'server-500',
        message: 'crash in accessing users database',
      });
    }
    req.decodedIdToken.name = user.name;
    req.body = {
      userUid: user.uid,
      displayName: user.name,
      productId: req.body.productId,
    };
    next();
  },
  proxyMiddleware
);

billingRouter.post('/jz18qknx', afterPaymentProxy);
billingRouter.get('/', getProxy);

export default billingRouter;
