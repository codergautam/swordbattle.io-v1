class TitleScene extends Phaser.Scene {
  constructor(playPreroll, callback) {
    super();
    this.playPreroll = playPreroll;
    this.callback = callback;
  }
 preload() {
try {
  document.getElementsByClassName("grecaptcha-badge")[0].style.opacity = 100;
} catch(e) {
  console.log("captcha hasnt loaded yet");
}


 // document.cookie = "validate=madebycodergautamdonthackorelseurstupid";
}

 create() {
  this.footerdone = false;
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
  this.footer = this.add.dom(this.canvas.width/2, this.canvas.height).createFromCache("footer").setOrigin(0.5).setScale(this.mobile?1:2);
  this.footer.y = this.canvas.height + (this.footer.height*2);

  this.background.displayHeight = this.canvas.height;
  this.background.displayWidth =this.canvas.width;
  this.nameBox = this.add.dom(this.canvas.width/2, 0 ).createFromCache("title");
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
      var myName = name.value;
     
      if(this.playPreroll) {
        if (typeof aiptag.adplayer !== "undefined") {
          this.nameBox.getChildByName("btn").innerHTML = "Connecting..";
                      this.nameBox.getChildByName("btn").style.backgroundColor = "grey";
                      this.music.stop();

            aiptag.cmd.player.push(()=> {
aiptag.adplayer = new aipPlayer({
 AD_WIDTH: 960,
 AD_HEIGHT: 540,
 AD_FULLSCREEN: true,
 AD_CENTERPLAYER: false,
 LOADING_TEXT: "loading advertisement",
 PREROLL_ELEM: function(){return document.getElementById("preroll");},
 AIP_COMPLETE:  (evt)=>  {
   /*******************
    ***** WARNING *****
    *******************
    Please do not remove the PREROLL_ELEM
    from the page, it will be hidden automaticly.
    If you do want to remove it use the AIP_REMOVE callback.
   */
    this.nameBox.destroy();
      document.getElementById("game").focus();
   this.callback(myName, this.music);

   console.log("Preroll Ad Completed: " + evt);
 }
});
});
aiptag.cmd.player.push(()=> { aiptag.adplayer.startPreRoll(); 
});
}  else {
this.nameBox.destroy();

this.callback(myName, this.music);
}
   } else {    

         this.nameBox.destroy();
        this.callback(myName, this.music);
   }
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
    this.text.x = this.canvas.width / 2;
    var footery =this.canvas.height - (this.footer.height);
    if(this.canvas.height < 384) footery = this.canvas.height - (this.footer.height / 2);
    if(this.footerdone) this.text.y = this.canvas.height / 4;
    if(this.footerdone) this.footer.y = footery;
    try {
    this.text.setFontSize( this.canvas.width / 10);
    } catch(e) {
      console.log("font size not set");
    }
    this.footer.x = this.canvas.width/2;
  };
        
    window.addEventListener("resize", resize, false);

resize();
    



  var footery =this.canvas.height - (this.footer.height);
  if(this.canvas.height < 384) footery = this.canvas.height - (this.footer.height / 2);

  this.tweens.add({
    targets: this.footer,
    y: footery,
    onComplete: () => {
      this.footerdone = true;
    },
    duration: 1000,
    ease: "Power2"
  });

  this.tweens.add({
    targets: this.text,
    y: this.canvas.height / 4,
    duration: 1000,
    ease: "Power2"
  });

}

 update(d) {
   this.nameBox.y = (this.mobile ? this.text.y + (this.text.height / 2) : this.text.y + (this.text.height));

   var footery =this.canvas.height - (this.footer.height);
   if(this.canvas.height < 384) footery = this.canvas.height - (this.footer.height / 2);

   if(this.footerdone && this.footer.y != footery) this.footer.y = footery;
}
}

export default TitleScene;