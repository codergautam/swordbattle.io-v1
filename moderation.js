module.exports = {
    bannedIps: [
        '34.133.168.193',
        '209.205.218.44',
        '23.227.141.157',
        '78.58.116.9',
        '73.222.174.240',
        '78.58.116.96',
        '34.135.84.39',
        '73.222.174.240',
      ],
      players: {},
      io: undefined,
    start(app) {
        app.get('/ipcheck/:token', (req, res) => {
            if (process.env.TOKEN == req.params.token) {
              var txt = '';
              if (Object.values(module.exports.players).length < 1) return res.send('len 0');
              Object.values(module.exports.players).forEach((player) => {
                var socket = io.sockets.sockets.get(player.id);
                txt += player.name + ' - ' + socket.ip + '<br>';
              });
              res.send(txt);
            } else {
              res.send('idot hackrs');
            }
          });
          
          app.get('/ipban/:token', (req, res) => {
            var token = req.params.token == process.env.TOKEN;
            if (token) {
              module.exports.bannedIps.push(req.query.ip);
              res.send(module.exports.bannedIps.toString());
            } else {
              res.send('idot');
            }
          });
          
          app.get('/ipunban/:token', (req, res) => {
            var token = req.params.token == process.env.TOKEN;
            if (token) {
              if (module.exports.bannedIps.includes(req.query.ip))
              module.exports.bannedIps = module.exports.bannedIps.filter((b) => b != req.query.ip);
              res.send(module.exports.bannedIps.toString());
            } else {
              res.send('idot');
            }
          });
    }
}