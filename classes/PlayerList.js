
class PlayerList {

  static getPlayer(id) {
    if(this.players.hasOwnProperty(id)) return this.players[id]
    else return undefined
  }
  static setPlayer(id, player) {
    this.players[id] = player
  }
  static deletePlayer(id) {
    if(this.players.hasOwnProperty(id)) {
       delete this.players[id]
       
    }
  }
  static has(id) {
    return this.players.hasOwnProperty(id)
  }
  static updatePlayer(player) {
    this.players[player.id] = player
  }
}
PlayerList.players = {}
PlayerList.deadPlayers = []
module.exports = PlayerList