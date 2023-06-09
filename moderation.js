const PlayerList = require("./classes/PlayerList");
const { timingSafeEqual } = require("crypto");
const tokenBuf=Buffer.from(process.env.TOKEN);
const tokenBufLen=Buffer.byteLength(tokenBuf);
/**
 * Validate the token that the user provides.
 * @param {String} uToken
 * @returns {Boolean} Whether the token was correct (false if incorrect, true otherwise)
 */
function validateToken(uToken) {
    const uTokenBuf=Buffer.from(uToken);
    const uTokenBufLen=Buffer.byteLength(uToken);
    // UTF-16 could probably cause issues here, so the buffer lengths are compared. The token length should not be a secret.
    if(uTokenBufLen!=tokenBufLen) return false;
    return timingSafeEqual(tokenBuf, uTokenBuf);
}
module.exports = {
    bannedIps: [
        "34.133.168.193",
        "209.205.218.44",
        "23.227.141.157",
        "78.58.116.9",
        "73.222.174.240",
        "78.58.116.96",
        "34.135.84.39",
        "73.222.174.240",
        "73.231.9.39"
      ],
      io: undefined,
    start(app, io) {
      app.get("/announcement/:token", (req, res) => {
        if (validateToken(req.params.token) && typeof req.query.message == "string") {
          io.sockets.send("announcement", req.query.message);
          res.send("Announcement sent to all players");
        } else {
          res.send("idot heckrs");
        }
      });
      app.get("/announcement1/:token", async (req, res) => {
        if (validateToken(req.params.token) && typeof req.query.message == "string" && typeof req.query.id == "string") {
          var all = await io.fetchSockets();
          var socket = all.find(s => s.id == req.query.id);
          if (socket) {
            socket.send("announcement", req.query.message);
          res.send("Announcement sent");
          } else {
            res.send("Invalid id?");
          }
        } else {
          res.send("idot heckrs");
        }
      });

        app.get("/ipcheck/:token", (req, res) => {
            if (validateToken(req.params.token)) {
              var txt = "";
              if (Object.values(PlayerList.players).length < 1) return res.send("len 0");
              Object.values(PlayerList.players).forEach((player) => {
                var socket = module.exports.io.sockets.sockets.get(player.id);
               if(socket) txt += player.name + " - " + socket.ip + " - "+player.id+"<br>";
              });
              res.send(txt);
            } else {
              res.send("idot heckrs");
            }
          });
          
          app.get("/ipban/:token", (req, res) => {
            if (validateToken(req.params.token)) {
                  var socket = module.exports.io.sockets.sockets.get(req.query.id);
              module.exports.bannedIps.push(socket.ip);
                socket.disconnect();
              res.send("banned "+socket.ip);
            } else {
              res.send("idot");
            }
          });
          
          app.get("/ipunban/:token", (req, res) => {
            if(typeof req.query.ip !== "string"){
                res.send("estúpido");
                return;
            }
            if (validateToken(req.params.token)) {
                var ip = req.query.ip.replace(/%20/g, " ");

              if (module.exports.bannedIps.includes(ip))
              module.exports.bannedIps = module.exports.bannedIps.filter((b) => b != ip);
              res.send("unbanned "+ip);
            } else {
              res.send("idot");
            }
          });
    }
};
