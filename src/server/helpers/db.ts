import postgres from 'postgres'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
dotenv.config()

if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set in .env file')
const sql = postgres(process.env.DATABASE_URL ?? "", {max: 5, idle_timeout:30, ssl: {rejectUnauthorized:false}})

async function usernameExists(username: string) {
  var exists = await sql`select exists(select 1 from accounts where lower(username)=lower(${username}))`;
  return exists[0].exists;
}

async function emailExists(email: string) {
  var exists = await sql`select exists(select 1 from accounts where lower(email)=lower(${email}))`;
  return exists[0].exists;
}

async function createUser(username: string, password: string, email: string) {
  if(!username || !password || !email) throw new Error('Username, password and email are required');
  var exists = await usernameExists(username);
  if(exists) throw new Error('Username already exists');
  exists = await emailExists(email);
  if(exists) throw new Error('Email already exists');
  var hash = await bcrypt.hash(password, 10);
  let secret = uuidv4();
  var user = await sql`insert into accounts (username, password, email, secret, skins) values (${username}, ${hash}, ${email}, ${secret}, ${JSON.stringify({collected: ["player"], selected: "player"})}) returning *`;
  return user[0];
}

export default {
  query: sql,
}
