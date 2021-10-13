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
        this.mePlayer = this.add.image(400, 100,"player").setScale(0.25)

        //sword
        this.meSword = this.add.image(400,100, "sword").setScale(0.25)

        //arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        //mouse down
        this.input.on('pointerdown', function (pointer) {
          this.mouseDown = true
        }, this);
        this.input.on('pointerup', function (pointer) {
          this.mouseDown = false
        }, this);


        //camera follow
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
    //sword rotation
    var mousePos = this.input
    this.meSword.angle = Math.atan2(mousePos.y - ((viewport().height - 10) / 2), mousePos.x - ((viewport().width - 10)/2))* 180 / Math.PI + 45;

    this.meSword.x = this.mePlayer.x+this.mePlayer.width/6*Math.cos(this.meSword.angle*Math.PI/180)
    this.meSword.y =  this.mePlayer.y+this.mePlayer.width/6*Math.sin(this.meSword.angle*Math.PI/180)

    if(this.mouseDown) this.meSword.angle -= 30
   
    //background movement
    this.background.setTilePosition(this.cameras.main.scrollX,this.cameras.main.scrollY);
 
    }

//for debugging on the chromebooks they fricking banned dev console
                window.onerror = function (msg, url, line) {
               document.write("Error : " + msg +"<br><br>");
                document.write("Line number : " + line +"<br><br>" );
               document.write("File : " + url);
              
            }