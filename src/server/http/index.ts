import path from 'path';
import fs from 'fs';

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


export default (res: any, req: any) => {
  try {
    const url = req.getUrl();
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
