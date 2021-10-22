class HealthBar {

    constructor (game, x, y, width, height)
    {

        this.bar = new Phaser.GameObjects.Graphics(game).setDepth(99);
  
        this.x = x;
        this.y = y;
        this.value = 100;
        
        this.height = height
        this.width = width
  
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
        this.bar.fillRect(this.x, this.y, this.width, this.height);
  
        //  Health
  
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, this.width-4, this.height-4);
  
        if (this.value < 30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor((this.width-4) * (this.value/100));
  
        this.bar.fillRect(this.x + 2, this.y + 2, d, this.height-4);
    }
  
    destroy ()
    {
      this.bar.destroy()
    }
  
  }
  

  export default HealthBar