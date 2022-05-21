import Phaser from "phaser";
class HealthBar {

    constructor (game, x, y, width, height, custom=false)
    {

        this.custom = custom;
        this.bar = new Phaser.GameObjects.Graphics(game).setDepth(99);
  
        this.x = x;
        this.y = y;

        this.maxValue = 100;
        this.value = 0;
        this.toLerp = 0;
        this.height = height;
        this.width = width;
  
        game.add.existing(this.bar);
    }
  
    setHealth (amount)
    {
  
        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
        this.value = clamp(amount, 0, this.maxValue);
  
        this.draw();
  
        return (this.value === 0);
    }
    setLerpValue(value) {
        this.toLerp = value;
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
  
        if(!this.custom) {
        if (this.value/this.maxValue < 0.30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else if(this.value/this.maxValue  < 0.5) {
           this.bar.fillStyle(0xFFFF00); 
        } else
        {
            this.bar.fillStyle(0x00ff00);
        }
    } else {

        this.bar.fillStyle(0x00FFFF);
    }

        var d = Math.floor((this.width-4) * (this.value/this.maxValue));
  
        this.bar.fillRect(this.x + 2, this.y + 2, d, this.height-4);
    }

    update() {
        const lerp = (start,end,amt) => (1-amt)*start+amt*end;

        this.setHealth(lerp(this.value, this.toLerp, 0.25));
       
    }
  
    destroy ()
    {
      this.bar.destroy();
    }
  
  }
  

  export default HealthBar;