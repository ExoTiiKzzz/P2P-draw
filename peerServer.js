import express from 'express';
import { createServer } from 'http';
import { ExpressPeerServer } from 'peer';
import serveStatic from 'serve-static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const peerServer = ExpressPeerServer;

const router = express.Router();

app.use(serveStatic(path.join(__dirname, 'public')));

app.use('/peerServer', peerServer(server, {}));

server.listen(process.env.PORT || 9000);

console.log("P2P broker started.", process.env.PORT);