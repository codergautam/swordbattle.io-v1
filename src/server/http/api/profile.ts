
import uws from 'uWebSockets.js';
import dotenv from 'dotenv'
import db from '../../helpers/db';
import ejs from 'ejs';
import path from  'path';
import fs from 'fs';
dotenv.config()


async function getData(user: string) {
  var dbuser =
    await db.query`SELECT * from accounts where lower(username)=lower(${user})`;
  if (!dbuser[0]) {
    return null;
  } else {
    var yo =
      await db.query`SELECT * FROM games WHERE lower(name)=${user.toLowerCase()} AND verified='true';`;

    var stats = await db.query`
		select a.dt,b.name,b.xp,b.kills,b.coins,b.time from
		(
		select distinct(created_at::date) as Dt from games where created_at >= ${
      dbuser[0].created_at
    }::date-1
		order by created_at::date
		) a
		left join
		(
		  SELECT name,created_at::date as dt1,(sum(coins)+(sum(kills)*300)) as xp,sum(kills) as kills ,sum(coins) as coins,
		  sum(time) as time FROM games WHERE verified='true' and lower(name)=${user.toLowerCase()} group by name,created_at::date
		) b on a.dt=b.dt1 order by a.dt asc
		`;
    var lb =
      await db.query`select name,(sum(coins)+(sum(kills)*300)) as xp from games where verified = true group by name order by xp desc`;
    var lb2 =
      await db.query`select name,(sum(coins)+(sum(kills)*300)) as xp from games where verified = true and EXTRACT(EPOCH FROM (now() - created_at)) < 86400 group by name order by xp desc`;
    return {
      user: dbuser[0],
      games: yo,
      stats: stats,
      lb: lb,
      lb2: lb2,
      cosmetics: JSON.parse(fs.readFileSync(path.join(process.cwd(), "cosmetics.json"), "utf8"))
    };
}
}


export default (res: uws.HttpResponse, req: uws.HttpRequest) => {
  let url = req.getUrl();
  let username = url.split("/")[1];
  // decode uri component
  try {
    username = decodeURIComponent(username);
  } catch (err) {
  }

  res.onAborted(() => {
  });


  getData(username).then((data) => {
  // Render
  if(data === null) {
    // 404
    try {
    res.writeStatus("404");
    res.end("404");
    } catch (err) {
      console.log(err);
    }
    return;
  }
  ejs.renderFile(path.join(process.cwd(), "ejs/user.ejs"), data as any, (err, str) => {
    if (err) {
      try {
      res.end(err.message);
      } catch (err) {
        console.log(err);
      }
      return;
    }
    try {
    res.end(str);
    } catch (err) {
      console.log(err);
    }
  });
  });
}