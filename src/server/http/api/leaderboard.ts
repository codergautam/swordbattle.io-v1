
import uws from 'uWebSockets.js';
import dotenv from 'dotenv'
import db from '../../helpers/db';
import ejs from 'ejs';
import path from  'path';
dotenv.config()


async function getData(queryObj: { [x: string]: string; type?: any; duration?: any; }) {
  let lbData;
  var type = ["coins", "kills", "time", "xp","totalkills","totaltime","totalcoins"].includes(queryObj.type)
    ? queryObj.type
    : "xp";
  var duration = ["all", "day", "week", "xp"].includes(queryObj.duration)
    ? queryObj.duration
    : "all";
  if (type !== "xp" && !type.startsWith("total")) {
    if (duration != "all") {
      var lb =
        await db.query`SELECT * from games where EXTRACT(EPOCH FROM (now() - created_at)) < ${
          duration == "day" ? "86400" : "608400"
        } ORDER BY ${db.query(type)} DESC, created_at DESC LIMIT 103`;
    } else {
      var lb = await db.query`SELECT * from games ORDER BY ${db.query(
        type
      )} DESC, created_at DESC LIMIT 103`;
    }
  } else {
    if (duration != "all") {
      if(type == "xp"){
      var lb =
        await db.query`select name,(sum(coins)+(sum(kills)*300)) as xp from games where verified = true and EXTRACT(EPOCH FROM (now() - created_at)) < ${
          duration == "day" ? "86400" : "608400"
        } group by name order by xp desc limit 103`;
      }else{
        var lb =
        await db.query`select name,sum(${db.query(type.slice(5))}) as ${db.query(type.slice(5))} from games where verified = true and EXTRACT(EPOCH FROM (now() - created_at)) < ${
          duration == "day" ? "86400" : "608400"
        } group by name order by ${db.query(type.slice(5))} desc limit 103`;
      }
    } else {
      if (type == "xp") {
      var lb =
        await db.query`select name,(sum(coins)+(sum(kills)*300)) as xp from games where verified = true group by name order by xp desc limit 103`;
      } else {
        var lb =
        await db.query`select name,sum(${db.query(type.slice(5))}) as ${db.query(type.slice(5))} from games where verified = true group by name order by ${db.query(type.slice(5))} desc limit 103`;
      }
      }
    lbData = lb.map((x) => {
      x.verified = true;
      return x;
    });
  }

  return {
    lb: lbData ?? [],
    type,
    duration,
  }
}


export default (res: uws.HttpResponse, req: uws.HttpRequest) => {
  let query = req.getQuery();
  // Make object from query
  let queryObj: { [key: string]: string } = {};
  query.split('&').forEach((q) => {
    let [key, value] = q.split('=');
    queryObj[key] = value;
  });

  res.onAborted(() => {

  });


  getData(queryObj).then((data) => {
  // Render
  ejs.renderFile(path.join(process.cwd(), "ejs/leaderboard.ejs"), data, (err, str) => {
    if (err) {
      res.end(err.message);
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