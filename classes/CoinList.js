
class CoinList {

    static getCoin(id) {
      if(this.coins.hasOwnProperty(id)) return this.coins[id]
      else return undefined
    }
    static addCoin(coin) {
      this.coins.push(coin)
    }
    static addCoins(coins) {
        coins.forEach(coin => {
            this.addCoin(coin)
        });
    }
    static deleteCoin(id) {
        this.coins = this.coins.filter(obj => obj.id !== id)    
    }
  }
  CoinList.coins = []
  module.exports = CoinList