class TitleScene extends Phaser.Scene {
  constructor(callback) {
    super()
    this.callback = callback
  }
 preload() {
   console.log("Loading Home Screen")
  document.getElementsByClassName("grecaptcha-badge")[0].style.opacity = 100;
  this.load.image('opening', '/assets/images/opening.png');
  this.load.html("form", "/textbox.html");
  this.load.html("promo", "/promo.html");
  this.load.audio('openingsound', '/assets/sound/opening.mp3')
 // document.cookie = "validate=madebycodergautamdonthackorelseurstupid";
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
  if(this.showPromo) {
            this.mobile = false;
        ((a)=>{if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) this.mobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
        if(this.mobile) this.showPromo = false
  }
  this.nameBox = this.add.dom(window.innerWidth/2, window.innerHeight/1.7 ).createFromCache("form");
     if(this.showPromo) {

       this.promo = this.add.dom(0, 0).createFromCache("promo")

       this.promo.x = (window.innerWidth / 2)
       this.promo.y =  (window.innerHeight / 2)
       this.promo.getChildByName("close").onclick = () => {
         this.promo.destroy()
       }
     }

  this.input.keyboard.on('keydown', function (event) {

    if(this.nameBox.getChildByName('name') && (this.nameBox.getChildByName('name').value.length >= 16 ||this.nameBox.getChildByName('name')  !== document.activeElement)) return
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
      console.log("Opening game screen..")
      this.nameBox.destroy()

    }
  }

  this.btnrect.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
       if(this.promo && this.promo.visible) {
       } else go()
  });
  this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  this.returnKey.on("down", event => {
   if(this.promo && this.promo.visible) {
     this.promo.destroy()
   } else go()
  });

  
  const resize = ()=>{
    this.game.scale.resize(window.innerWidth, window.innerHeight)
  
    this.nameBox.x = window.innerWidth / 2
    this.nameBox.y = window.innerHeight / 1.8
    if(this.showPromo) {
              const convert = (num, val, newNum) => (newNum * val) / num
       this.promo.x = (window.innerWidth / 2)
       this.promo.y =  (window.innerHeight / 2)
    }
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

    console.log("Load complete")
    
}

 update() {
  this.text.setFontSize( window.innerWidth / 10)
    if(this.text.y < window.innerHeight/3) this.text.y += 10



}
}

export default TitleScene;