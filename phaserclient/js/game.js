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
        //background
        this.background = this.add.tileSprite(0, 0,viewport().width-10, viewport().height-10, 'background').setOrigin(0).setScrollFactor(0,0);
        this.background.fixedToCamera = true;

        //player 
        this.mePlayer = this.add.image(400, 100,"player")
        this.mePlayer.setScale(0.25)

        //arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        this.cameras.main.startFollow(this.mePlayer);
    }

    function update ()
    {
        var wKey = this.input.keyboard.addKey('W'); 
        var aKey = this.input.keyboard.addKey('A');  // Get key object
        var sKey = this.input.keyboard.addKey('S'); 
        var dKey = this.input.keyboard.addKey('D'); 

            if (this.cursors.up.isDown || wKey.isDown)
    {
        this.mePlayer.y -= 5
        
    }
    else if (this.cursors.down.isDown ||sKey.isDown)
    {
        this.mePlayer.y += 5
    }
    if (this.cursors.right.isDown||dKey.isDown)
    {
        this.mePlayer.x += 5
      
    }
    else if (this.cursors.left.isDown||aKey.isDown )
    {
        this.mePlayer.x -= 5
      
    }
    this.background.setTilePosition(this.cameras.main.scrollX,this.cameras.main.scrollY);
 
    }