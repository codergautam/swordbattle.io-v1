
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
      this.players[id] = null
      delete this.players[id]
      this.deadPlayers.push(id)
     //  console.log("kjifjgkjifjgkjifjgkjifjgkjifjgkjifjgkjifjgkjifjgvvvvvvvvvvv")
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