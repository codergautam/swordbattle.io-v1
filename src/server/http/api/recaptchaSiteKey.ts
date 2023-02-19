// post: /api/signup
import uws from 'uWebSockets.js';
import dotenv from 'dotenv'
dotenv.config()

export default (res: uws.HttpResponse, req: uws.HttpRequest) => {
  if (process.env.USERECAPTCHA !== 'false') {
    // Recaptcha is enabled for this game instance
    if (process.env.CAPTCHASITE) {
      // Recaptcha is enabled for this game instance
      res.writeHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        siteKey: process.env.CAPTCHASITE,
      }));
    } else {
      // Recaptcha is enabled for this game instance, but the site key is missing
      res.writeHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        error: 'Could not find recaptcha site key'
      }));
    }
  } else {
    // Recaptcha is disabled for this game instance
    res.writeHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: 'This game instance has disabled recaptcha'
    }));
  }
}