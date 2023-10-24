const {sql} = require("./database");
async function createGames() {
  if(await checkIfTableExists("games")) {
    console.log("'games' table already exists.");
    return;
  }
  console.log("Creating 'games' table");
  await sql`
  CREATE TABLE public.games (
    "time" bigint NULL,
    killerverified boolean NULL,
    verified boolean NULL,
    name text NULL,
    killedby text NULL,
    created_at timestamp without time zone NULL DEFAULT now(),
    kills bigint NULL,
    coins bigint NULL,
    id serial NOT NULL
  );`;
  await sql`
  ALTER TABLE
    public.games
  ADD
    CONSTRAINT games_pkey PRIMARY KEY (id)`;
  console.log("Created 'games' table");
}
async function createContent() {
  if(await checkIfTableExists("content")) {
    console.log("'content' table already exists.");
    return;
  }
  console.log("Creating 'content' table");
  await sql`
  CREATE TABLE public.content (
    id serial NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    link text NULL,
    title text NULL,
    author text NULL,
    chance integer NOT NULL DEFAULT 1,
    source text NOT NULL DEFAULT 'youtube'::text,
    label text NULL
  );
  `;
  await sql`
  ALTER TABLE
    public.content
  ADD
    CONSTRAINT content_pkey PRIMARY KEY (id)
  `;
  console.log("Created 'content' table");
}
async function createAccounts() {
  if(await checkIfTableExists("accounts")) {
    console.log("'accounts' table already exists.");
    return;
  }
  await sql`
  CREATE TABLE public.accounts (
    skins jsonb NULL,
    password text NOT NULL,
    secret text NOT NULL,
    email text NULL,
    username text NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    id serial NOT NULL,
    lastusernamechange timestamp(6) without time zone NULL
  );`;
}
async function createStats() {
  if(await checkIfTableExists("stats")) {
    console.log("'stats' table already exists.");
    return;
  }
  console.log("Creating 'stats' table");
  await sql`
  CREATE TABLE public.stats (
    id serial NOT NULL,
    game_date date NOT NULL,
    username text NOT NULL,
    game_time bigint NOT NULL DEFAULT 0,
    game_count bigint NOT NULL DEFAULT 0,
    stabs integer NOT NULL DEFAULT 0,
    coins integer NOT NULL DEFAULT 0
  );`;
  console.log("Created 'stats table'");
}
async function checkIfTableExists(name, schema="public") {
  return (await (sql`
  SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE  schemaname = ${schema}
   AND    tablename  = ${name}
   );`))[0].exists;
}
console.log("Creating tables...");
Promise.all([
  createGames(),
  createContent(),
  createAccounts(),
  createStats()
]).then(()=>{
  console.log("All done!");
  process.exit();
});
