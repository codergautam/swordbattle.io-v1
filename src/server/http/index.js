const path = require('path');
const fs = require('fs');

module.exports = (res, req) => {
  try {
    const url = req.getUrl();
    const p = `../../../dist${url === '/' ? '/index.html' : url}`;
    res.end(fs.readFileSync(path.resolve(__dirname, p)));
  } catch (e) {
    try {
      const url = req.getUrl();
      const p = `../../../public${url}`;
      res.end(fs.readFileSync(path.resolve(__dirname, p)));
    } catch {
      res.writeStatus('404');
      res.writeHeader('Content-Type', 'text/html');
      res.end(JSON.stringify({
        status: 404,
        message: 'Error',
      }));
    }
  }
};
