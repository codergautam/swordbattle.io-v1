// post: /api/signup
import uws from 'uWebSockets.js';
import readJson from '../../helpers/jsonBody';
import { verifyRecaptcha } from '../../helpers/recaptcha';
import dotenv from 'dotenv'
import emailValidator from 'email-validator'
import PasswordValidator from 'password-validator';
import FilterP from "purgomalum-swear-filter";
import * as FilterL from "leo-profanity";
import db from '../../helpers/db';
const filter = new FilterP();
dotenv.config()



export default (res: uws.HttpResponse, req: uws.HttpRequest) => {
  console.log("signup");
  try {
  readJson(res, async (json) => {
    try {
    res.writeHeader('Content-Type', 'application/json');

    if(process.env.USERECAPTCHA !== 'false') {
      if(!json.captcha) {
        res.end(JSON.stringify({
          success: false,
          message: 'Missing captcha',
        }));
        return;
      }

      const captcha = await verifyRecaptcha(json.captcha);
      if(!captcha.success) {
        res.end(JSON.stringify({
          success: false,
          message: 'Captcha failed, ' + captcha.error,
        }));
        return;
      }
    }

    // Required fields -secret
    if(!json.secret ) {
      res.end(JSON.stringify({
        success: false,
        message: 'Missing secret',
      }));
      return;
    }

    try {
      let user = await db.getUserFromSecret(json.secret);
      if(!user) {
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid secret',
        }));
        return;
      }
      return res.end(JSON.stringify({
        success: true,
        user:{
          id: user.id,
          username: user.username,
          email: user.email,
        },
      }));
    } catch(e: any) {
      let message = e.message ?? 'Unknown error';
      res.end(JSON.stringify({
        success: false,
        message,
      }));
    }
  } catch(e: any) {
    console.log("Something went wrong");
  }
  }, () => {
    console.log("Failed to read json");
  });
  } catch(e: any) {
    console.log("Something went wrong");
  }
}