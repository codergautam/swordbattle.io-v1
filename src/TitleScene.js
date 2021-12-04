class TitleScene extends Phaser.Scene {
  constructor(callback) {
    super();
    this.callback = callback;
  }
 preload() {
try {
  document.getElementsByClassName("grecaptcha-badge")[0].style.opacity = 100;
} catch(e) {
  console.log("captcha hasnt loaded yet");
}
  this.load.image("opening", "/assets/images/opening.png");
  this.load.html("title", "/title.html");
  this.load.html("promo", "/promo.html");
  this.load.audio("openingsound", "/assets/sound/opening.mp3");

 // document.cookie = "validate=madebycodergautamdonthackorelseurstupid";
}

 create() {
  
   this.redirect = false;
  var access = true;
  try {
    window.localStorage;
  } catch(e) {
    access = false;
  }
try {
  this.music = this.sound.add("openingsound", {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0
});
this.music.play();
} catch(e) {

return;

}

this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


  this.background = this.add.image(0, 0, "opening").setOrigin(0).setScrollFactor(0, 0).setScale(2);
  this.background.displayHeight = this.canvas.height;
  this.background.displayWidth =this.canvas.width;
  this.nameBox = this.add.dom(this.canvas.width/2, this.canvas.height/1.7 ).createFromCache("title");
     if(this.showPromo) {

       this.promo = this.add.dom(0, 0).createFromCache("promo");

       this.promo.x = (this.canvas.width / 2);
       this.promo.y =  (this.canvas.height / 2);
     
       this.promo.getChildByName("close").onclick = () => {
         this.promo.destroy();
       };
 
     }

  this.input.keyboard.on("keydown", function (event) {

    if(this.nameBox.getChildByName("name") && (this.nameBox.getChildByName("name").value.length >= 16 ||this.nameBox.getChildByName("name")  !== document.activeElement)) return;
   	if(event.key == "a"){
   		this.nameBox.getChildByName("name").value+=event.key;
   	}else if(event.key == "s"){
   		this.nameBox.getChildByName("name").value+=event.key;
   	}else if(event.key == "d"){
   		this.nameBox.getChildByName("name").value+=event.key;
   	}else if(event.key == "w"){
   		this.nameBox.getChildByName("name").value+=event.key;
   	} else if(event.which == 32) {
       this.nameBox.getChildByName("name").value+=event.key;
     }
}.bind(this));
  if(access) this.nameBox.getChildByName("name").value = window.localStorage.getItem("oldName")  ?  window.localStorage.getItem("oldName") : "";
  else this.nameBox.getChildByName("name").value = "";

  
  this.done = false;
  this.text = this.add.text(this.canvas.width/2, 0, "Swordbattle.io", {
    fontSize: "64px",
    fill: "#000000"
  }).setOrigin(0.5);
  const go = () => {
    let name = this.nameBox.getChildByName("name");

  // let name ={value: "hi"}
    if(!name) return;
    else if(name.value == "") return;
    else if(this.done) return;
    else {
      this.done = true;
      if(access) window.localStorage.setItem("oldName", name.value);
      this.callback(name.value, this.music);
      this.nameBox.destroy();

    }
  };

  this.nameBox.getChildByName("btn").onclick = () => {
    if(this.promo && this.promo.visible) {
    } else go();
  };
  this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  this.returnKey.on("down", event => {
   if(this.promo && this.promo.visible) {
     this.promo.destroy();
   } else go();
  });

  
  const resize = ()=>{
    
    this.game.scale.resize(this.canvas.width, this.canvas.height);
    this.background.displayHeight = this.canvas.height;
    this.background.displayWidth =this.canvas.width;
    this.nameBox.x = this.canvas.width / 2;
    this.nameBox.y = this.canvas.height / 2;
    this.text.x = this.canvas.width / 2;
    if(this.text.y != 0) this.text.y = this.canvas.height / 3;
  };
        
    window.addEventListener("resize", resize, false);

resize();
    
}

 update(d) {
  function lerp (start, end, amt){
    return (1-amt)*start+amt*end;
  }
   try {
  this.text.setFontSize( this.canvas.width / 10);
  if(this.text.y < this.canvas.height/3) this.text.y = lerp(this.text.y, this.canvas.height/3, 0.1);
   } catch(e) {


if(this.redirect) return;
this.redirect = true;
alert("Your administrator has blocked swordbattle.io\nDon't worry, You are being redirected to a proxy server to attempt to bypass this.");
  window.location.replace("https://sword-io-game.herokuapp.com/");

  }
}
}

export default TitleScene;