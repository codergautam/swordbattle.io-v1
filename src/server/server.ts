import uws from 'uWebSockets.js';
import http from './http';
import ws from './ws';

const PORT = 3000; // TODO: maybe put this into .env file

uws.App().ws('/*', ws).get('/*', http).listen(PORT, (e) => {
  if (e) {
    console.log(`server started at http://localhost:${PORT}`, e);
  }
});
