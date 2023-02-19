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
  readJson(res, async (json) => {
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

    // Required fields - username and password
    if(!json.username || !json.password) {
      res.end(JSON.stringify({
        success: false,
        message: 'Missing username or password',
      }));
      return;
    }
    // Required fields - email
    if(!json.email) {
      res.end(JSON.stringify({
        success: false,
        message: 'Missing email',
      }));
      return;
    }
    // Validate email
    if(!emailValidator.validate(json.email)) {
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid email',
      }));
      return;
    }
    // Validate password
    const schema = new PasswordValidator();
    schema
      .is()
      .min(5, "Password has to be at least 5 chars") // Minimum length 5
      .is()
      .max(20, "Password cant be longer than 20 chars") // Maximum length 20
      .has()
      .not()
      .spaces(undefined, "Password cant contain spaces"); // Should not have spaces
    if(!schema.validate(json.password)) {
      res.end(JSON.stringify({
        success: false,
        message: "Invalid password: "+((schema.validate(json.password, { details: true }) as any)[0].message),
      }));
      return;
    }

    var username = json.username;
    if(username.length >= 20) {
      res.end(JSON.stringify({
        success: false,
        message: "Username can't be longer than 20 characters",
      }));
      return;
    }
    if(username.charAt(0) == " " || username.charAt(username.length - 1) == " ") {
      res.end(JSON.stringify({
        success: false,
        message: "Username can't start or end with a space",
      }));

      return;
    }
    if(username.includes("  ")) {
      res.end(JSON.stringify({
        success: false,
        message: "Username can't contain two spaces in a row",
      }));
      return;
    }
    var regex = /^[a-zA-Z0-9!@"$%&:';()*\+,;\-=[\]\^_{|}<>~` ]+$/g;
    if(!username.match(regex)) {
      res.end(JSON.stringify({
        success: false,
        message: "Username can only contain letters, numbers, spaces, and the following symbols: !@\"$%&:';()*\+,-=[\]\^_{|}<>~`",
      }));
      return;
    }
    try {
      var profanity = FilterL.check(username);
      if(profanity) {
        res.end(JSON.stringify({
          success: false,
          message: "Username can't contain profanity/bad words",
        }));
      }
      profanity = await filter.containsProfanity(username);
      if(profanity) {
        res.end(JSON.stringify({
          success: false,
          message: "Username can't contain profanity/bad words",
        }));
        return;
      }
    } catch (error) {
      console.log(error);
    }

    try {
      console.log("Creating user", json.username);
      let user = await db.createUser(json.username, json.password, json.email);
      console.log("Created user", user);
      res.end(JSON.stringify({
        success: true,
        secret: user.secret,
      }));
    } catch (error: any) {
      let message = error.message ?? 'Unknown error';
      res.end(JSON.stringify({
        success: false,
        message,
      }));
    }


  }, () => {
    console.log("Failed to read json");
  });
}