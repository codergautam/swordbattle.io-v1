

class HealthBar {

    constructor (game, x, y)
    {
        this.bar = new Phaser.GameObjects.Graphics(game);
  
        this.x = x;
        this.y = y;
        this.value = 100;
        this.p = 76 / 100;
  
        game.add.existing(this.bar);
    }
  
    setHealth (amount)
    {
        this.value = amount;
  
        if (this.value < 0)
        {
            this.value = 0;
        }
  
        this.draw();
  
        return (this.value === 0);
    }
  
    draw ()
    {
        this.bar.clear();
  
        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 80, 16);
  
        //  Health
  
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, 76, 12);
  
        if (this.value < 30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }
  
        var d = Math.floor(this.p * this.value);
  
        this.bar.fillRect(this.x + 2, this.y + 2, d, 12);
    }
  
    destroy ()
    {
      this.bar.destroy()
    }
  
  }
  

  export default HealthBar