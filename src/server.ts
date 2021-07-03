import app from './app';
import http from 'http';
import { AddressInfo } from 'net';
const server = http.createServer(app);

const isAddressInfo = (obj: any): obj is AddressInfo =>
  'address' in obj && 'family' in obj && 'port' in obj;

const handleOnConnection = () => {
  const serverAddress = server.address();
  if (isAddressInfo(serverAddress)) {
    console.log(`listening to port ${serverAddress.port}`);
    return;
  }
  throw new Error('failed on starting server');
};

server.listen(process.env.PORT || 8000, handleOnConnection);

export default server;
