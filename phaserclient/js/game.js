function viewport()
{
var e = window
, a = 'inner';
if ( !( 'innerWidth' in window ) )
{
a = 'client';
e = document.documentElement || document.body;
}
return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

    var config = {
        type: Phaser.AUTO,
        width: viewport().width-10,
        height: viewport().height-10,
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        backgroundColor: "#FFFFFF"
    };

    var game = new Phaser.Game(config);

    function preload ()
    {
      this.load.image("player", "/assets/images/player.png")
      this.load.image("sword", "/assets/images/sword.png")
      this.load.image('background','/assets/images/background.jpeg');
    }

    function create ()
    {
       this.add.tileSprite(0, 0,1000, 1000, 'background');
      // game.world.setBounds(0, 0, 1000, 1000);
        var mePlayer = this.add.image(400, 100,"player")
        this.cameras.main.startFollow(this.player, true);
        mePlayer.setScale(0.25)
        this.cursors = this.input.keyboard.createCursorKeys();
         
         
    }

    function update ()
    {
            if (this.cursors.up.isDown)
    {
        mePlayer.body.moveUp(300)
    }
    else if (this.cursors.down.isDown)
    {
        mePlayer.body.moveDown(300);
    }
    }