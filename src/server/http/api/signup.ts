// post: /api/signup
import uws from 'uWebSockets.js';
import readJson from '../../helpers/jsonBody';

export default (res: uws.HttpResponse, req: uws.HttpRequest) => {
  console.log("signup");
  readJson(res, (json) => {
    console.log(json);
    res.writeHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 200,
      message: 'Success',
    }));
  }, () => {
    console.log("Failed to read json");
  });
}