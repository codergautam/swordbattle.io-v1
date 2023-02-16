import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()

let threshold = 0.3;
if(!process.env.CAPTCHASECRET) throw new Error('CAPTCHASECRET is not set in .env file')

export async function verifyRecaptcha(token: string) {
  var response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
    params: {
      secret: process.env.CAPTCHASECRET,
      response: token
    }
  })
  if(!response.data.success) return {
    success: false,
    error: response.data['error-codes']?.[0] ?? 'unknown'
  }
  if(response.data.score < threshold) return {
    success: false,
    error: 'score'
  }
  return {
    success: true
  }
}