
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
  readJson(res, async (json) => {
    res.writeHeader('Content-Type', 'application/json');

    // Required fields - secret
    if(!json.secret) {
      res.end(JSON.stringify({
        success: false,
        message: 'Missing secret',
      }));
      return;
    }

    // Verify secret
    let user = await db.getUserFromSecret(json.secret);
    if(!user) {
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid secret',
      }));
      return;
    }

    // Required field - newname
    if(!json.newName) {
      res.end(JSON.stringify({
        success: false,
        message: 'Please enter a new name',
      }));
      return;
    }

    var username = json.newName;
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
      console.log("Changing name from " + user.username + " to " + json.newName + "");
      let change = await db.changeName(user.username, json.newName);
      res.end(JSON.stringify({
        success: true
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