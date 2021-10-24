class TitleScene extends Phaser.Scene {
  constructor(callback) {
    super()
    this.callback = callback
  }
 preload() {
  this.load.image('background', '/assets/images/background.jpeg');
  this.load.html("form", "textbox.html");

}

 create() {
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

  this.background = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background').setOrigin(0).setScrollFactor(0, 0).setScale(2);
  this.text = this.add.text(window.innerWidth/2, 0, 'Sword.io', {
    fontSize: '64px',
    fill: '#000000'
  }).setOrigin(0.5);
  this.nameBox = this.add.dom(window.innerWidth/2, window.innerHeight/1.7 ).createFromCache("form");
  
  this.nameBox.getChildByName("name").value = getCookie("oldName")
  this.done = false
}

 update() {
   this.text.setFontSize( window.innerWidth / 10)
    if(this.text.y < window.innerHeight/3) this.text.y += 10

    this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.returnKey.on("down", event => {
      let name = this.nameBox.getChildByName("name");
      if(!name) return
      else if(name.value == "") return
      else if(this.done) return
      else {
        this.done = true
        document.cookie = "oldName="+name.value;
        this.nameBox.destroy()
        this.callback(name.value)
      }
    });
    
    const resize = ()=>{
      this.game.scale.resize(window.innerWidth, window.innerHeight)
      this.background.width = window.innerWidth
      this.background.height = window.innerHeight
      this.text.x = window.innerWidth / 2
      this.text.y = window.innerHeight / 3
      this.nameBox.x = window.innerWidth / 2
      this.nameBox.y = window.innerHeight / 1.7
    }
          
      window.addEventListener("resize", resize, false);

}
}

export default TitleScene;