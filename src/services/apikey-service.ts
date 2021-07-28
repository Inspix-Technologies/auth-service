import { Router } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

const apiKeyRouter = Router();
const apiKeyServiceProxy = createProxyMiddleware({
  target: process.env.BILLING_SERVICE_ADDRESS!,
  onProxyReq: fixRequestBody,
});

apiKeyRouter.use('/', apiKeyServiceProxy);

export default apiKeyRouter;
