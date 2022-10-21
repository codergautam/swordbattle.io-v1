const uws = require('uWebSockets.js');
require('isomorphic-fetch');

const http = require('./http');
const ws = require('./ws');

uws.App().ws('/*', ws).get('/*', http).listen(3000, (e) => {
  if (e) {
    console.log('server started!', e);
  }
});
