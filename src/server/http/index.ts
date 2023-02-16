import path from 'path';
import fs from 'fs';
import { routes } from './api/apiBase';
import uws from 'uWebSockets.js';

function contentType(p: string, res: { writeHeader: (arg0: string, arg1: string) => void; }){
  const ext = path.extname(p);
  switch (ext) {
    case '.html':
      res.writeHeader('Content-Type', 'text/html');
      break;
    case '.js':
      res.writeHeader('Content-Type', 'text/javascript');
      break;
    case '.css':
      res.writeHeader('Content-Type', 'text/css');
      break;
    case '.json':
      res.writeHeader('Content-Type', 'application/json');
      break;
    case '.png':
      res.writeHeader('Content-Type', 'image/png');
      break;
    case '.jpg':
      res.writeHeader('Content-Type', 'image/jpg');
      break;
    case '.wav':
      res.writeHeader('Content-Type', 'audio/wav');
      break;
  }
}


export default (res: uws.HttpResponse, req: uws.HttpRequest) => {
const url = req.getUrl();
// check if post
console.log(req.getMethod());
  if(req.getMethod().toLowerCase() === 'post' && routes[url]) return routes[url](res, req);
  try {
    const p = `../../../dist${url === '/' ? '/index.html' : url}`;
    contentType(p, res);
    res.end(fs.readFileSync(path.resolve(__dirname, p)));
  } catch (e) {
    try {
      const url = req.getUrl();
      const p = `../../../public${url}`;
      contentType(p, res);
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
