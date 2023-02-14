import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set in .env file')
const sql = postgres(process.env.DATABASE_URL ?? "", {max: 5, idle_timeout:30, ssl: {rejectUnauthorized:false}})

export default {
  query: sql,
}
