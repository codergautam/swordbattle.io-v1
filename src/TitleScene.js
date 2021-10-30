class TitleScene extends Phaser.Scene {
  constructor(callback) {
    super()
    this.callback = callback
  }
 preload() {
  this.load.image('opening', '/assets/images/opening.png');
  this.load.html("form", "/textbox.html");
  this.load.audio('opening', '/assets/sound/opening.mp3')

}

 create() {
  this.music = this.sound.add('opening', {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0
});
this.music.play()
//cookie get function
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

//actual code
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  this.background = this.add.image(0, 0, 'opening').setOrigin(0).setScrollFactor(0, 0).setScale(2);
  this.background.displayHeight = window.innerHeight
  this.background.displayWidth = window.innerWidth
  this.text = this.add.text(window.innerWidth/2, 0, 'Sword.io', {
    fontSize: '64px',
    fill: '#000000'
  }).setOrigin(0.5);
  this.nameBox = this.add.dom(window.innerWidth/2, window.innerHeight/1.7 ).createFromCache("form");
  this.input.keyboard.on('keydown', function (event) {
   	if(event.key == 'a'){
   		this.nameBox.getChildByName('name').value+=event.key;
   	}else if(event.key == 's'){
   		this.nameBox.getChildByName('name').value+=event.key;
   	}else if(event.key == 'd'){
   		this.nameBox.getChildByName('name').value+=event.key;
   	}else if(event.key == 'w'){
   		this.nameBox.getChildByName('name').value+=event.key;
   	} else if(event.which == 32) {
       this.nameBox.getChildByName('name').value+=event.key;
     }
}.bind(this));
  try {
  this.nameBox.getChildByName("name").value = getCookie("oldName")
  } catch(e) {
    document.write("Something went wrong..\n\nProbably due to some kind of proxy enforced by your school or administrator")
  }
  this.done = false

  this.btnrect = this.add.rectangle(0, 0, 0, 0, 0x00FF00);
  this.btntext = this.add.text(window.innerWidth / 2, window.innerHeight / 1.2, 'Play', {
      fontSize: '48px',
      fill: '#000000'
  }).setOrigin(0.5);
  this.btnrect.x = this.btntext.x - (this.btntext.width/2) - 5
  this.btnrect.y = this.btntext.y - (this.btntext.height/2) - 5
  this.btnrect.width = this.btntext.width + 10
  this.btnrect.height = this.btntext.height + 10
  //this.stats.y -= this.stats.height
  const go = () => {
    let name = this.nameBox.getChildByName("name");
    if(!name) return
    else if(name.value == "") return
    else if(this.done) return
    else {
      this.done = true
      document.cookie = "oldName="+name.value;
      this.nameBox.destroy()
      
      this.callback(name.value, this.music)
    }
  }

  this.btnrect.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
      go()
  });
  this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  this.returnKey.on("down", event => {
    go()
  });

  
  const resize = ()=>{
    this.game.scale.resize(window.innerWidth, window.innerHeight)
    this.text.setFontSize( window.innerWidth / 10)
    this.nameBox.x = window.innerWidth / 2
    this.nameBox.y = window.innerHeight / 1.8
    this.btntext.x = window.innerWidth / 2 
    this.btntext.y =  window.innerHeight / 1.7 + this.nameBox.height 
    this.btnrect.width = this.btntext.width + 10 
    this.btnrect.height = this.btntext.height + 10
    this.btnrect.x = this.btntext.x - (this.btntext.width/2) - 5
    this.btnrect.y = this.btntext.y - (this.btntext.height/2) - 5
    this.btnrect.width = this.btntext.width + 10
    this.btnrect.height = this.btntext.height + 10
    this.background.displayWidth = window.innerWidth
    this.background.displayHeight = window.innerHeight
    this.text.x = window.innerWidth / 2
    this.text.y = window.innerHeight / 3

  }
        
    window.addEventListener("resize", resize, false);

    resize()
}

 update() {

    if(this.text.y < window.innerHeight/3) this.text.y += 10



}
}

export default TitleScene;