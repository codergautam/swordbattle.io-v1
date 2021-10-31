class TitleScene extends Phaser.Scene {
  constructor(callback) {
    super()
    this.callback = callback
  }
 preload() {
  document.getElementsByClassName("grecaptcha-badge")[0].style.opacity = 100;
  this.load.image('opening', '/assets/images/opening.png');
  this.load.html("form", "/textbox.html");
  this.load.audio('openingsound', '/assets/sound/opening.mp3')
  document.cookie = "validate=madebycodergautamdonthackorelseurstupid";
}

 create() {
  this.music = this.sound.add('openingsound', {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0
});
this.music.play()

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

    if(this.nameBox.getChildByName('name') && this.nameBox.getChildByName('name').value.length >= 16) return
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

  this.nameBox.getChildByName("name").value = window.localStorage.getItem("oldName")  ?  window.localStorage.getItem("oldName") : ""

  
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
 
  const go = () => {
    let name = this.nameBox.getChildByName("name")

  // let name ={value: "hi"}
    if(!name) return
    else if(name.value == "") return
    else if(this.done) return
    else {
      this.done = true
      window.localStorage.setItem("oldName", name.value)
      this.callback(name.value, this.music)
      this.nameBox.destroy()

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
  
    this.nameBox.x = window.innerWidth / 2
    this.nameBox.y = window.innerHeight / 1.8
    this.btntext.x = window.innerWidth / 2 
   this.btntext.y =  window.innerHeight / 1.7 + this.nameBox.height 
   //this.btntext.y =  window.innerHeight / 1.7 + 10
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
  this.text.setFontSize( window.innerWidth / 10)
    if(this.text.y < window.innerHeight/3) this.text.y += 10



}
}

export default TitleScene;