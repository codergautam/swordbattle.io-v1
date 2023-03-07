
import uws from 'uWebSockets.js';
import readJson from '../../helpers/jsonBody';
import { verifyRecaptcha } from '../../helpers/recaptcha';
import dotenv from 'dotenv'
import db from '../../helpers/db';
dotenv.config()



export default (res: uws.HttpResponse, req: uws.HttpRequest) => {
  readJson(res, async (json) => {
    res.writeHeader('Content-Type', 'application/json');

    try {
    let identifier = json.identifier; // username or email
    let password = json.password;

    if(!identifier || !password) {
      res.end(JSON.stringify({
        success: false,
        message: 'Missing username/email or password',
      }));
      return;
    }

    // Recaptcha
    if(process.env.USERECAPTCHA !== 'false') {
      if(!json.captcha) {
        res.end(JSON.stringify({
          success: false,
          message: 'Missing captcha',
        }));
        return;
      }
        let checked = await verifyRecaptcha(json.captcha);
        if(!checked.success) {
          res.end(JSON.stringify({
            success: false,
            message: 'Captcha failed, ' + checked.error,
          }));
          return;
        }
    }

    // Check if user exists
    let user = await db.getUser(identifier);
    if(!user) {
      res.end(JSON.stringify({
        success: false,
        message: 'Couldn\'t find a user with that username/email',
      }));
      return;
    }

    // Check password
    try {
      await db.login(identifier, password);
    } catch(err) {
      res.end(JSON.stringify({
        success: false,
        message: "Invalid password",
      }));
      return;
    }

    // Send response (the user's secret)
    res.end(JSON.stringify({
      success: true,
      secret: user.secret,
    }));
    } catch(err) {
      res.end(JSON.stringify({
        success: false,
        message: "Something went wrong",
      }));
    }
  }, () => {
    console.log("Failed to read json");
  });
}