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
  let id = uuidv4();
  var user = await sql`insert into accounts (username, password, email, secret, skins, id) values (${username}, ${hash}, ${email}, ${secret}, ${JSON.stringify({collected: ["player"], selected: "player"})}, ${id}) returning *`;
  return user[0];
}

/**
 * Get a user by their username or email
 * @param identifier Username or email
 * @returns SQL row
 */
async function getUser(identifier: string) {
  var user = await sql`select * from accounts where lower(username)=lower(${identifier}) or lower(email)=lower(${identifier})`;
  return user[0];
}

async function login(usernameOrEmail: string, password: string) {
  var user = await getUser(usernameOrEmail);
  if(!user) throw new Error('User not found');
  var match = await bcrypt.compare(password, user.password);
  if(!match) throw new Error('Invalid password');
  return user.secret;
}

async function changeName(username: string, newName: string) {
  var user = await getUser(username);
  if(!user) throw new Error('User not found');
  var exists = await usernameExists(newName);
  if(exists) throw new Error('Username already exists');
  var daysSince = await sql`select (now()::date - lastusernamechange::date) as days from accounts where secret=${user.secret}`;
  if(daysSince[0].days && daysSince[0].days < 7) {
    throw new Error('You can change your name again in ' + (7 - daysSince[0].days) + ' days');
  }
  await sql`update accounts set lastusernamechange=now() where secret=${user.secret}`;
  await sql`update accounts set username=${newName} where secret=${user.secret}`;
  await sql`UPDATE games SET name=${newName} WHERE lower(name)=${username.toLowerCase()} AND verified=true`;


  return true;
}
async function getUserFromSecret(secret: string) {
  var user = await sql`select * from accounts where secret=${secret}`;
  return user[0];
}

export default {
  query: sql,
  createUser,
  getUser,
  login,
  changeName,
  getUserFromSecret
}
