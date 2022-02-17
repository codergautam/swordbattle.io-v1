import ImgButton from "./PhaserImgButton";
import Button from  "./PhaserButton"
import axios from "axios";

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
          var clamp = (val, min, max) => {
    if(val < min) return min;
    if(val > max) return max;
    return val;
  };
 
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



  this.background = this.add.image(0, 0, "opening").setOrigin(0).setScrollFactor(0, 0).setScale(2);
  this.footer = this.add.dom(this.canvas.width/2, this.canvas.height).createFromCache("footer").setOrigin(0.5).setScale(this.mobile?1:2);


  this.nameBox = this.add.dom(this.canvas.width/2, 0 ).createFromCache("title");

  if(this.showPromo) {

    this.promo = this.add.dom(0, 0).createFromCache("promo");

    this.promo.x = (this.canvas.width / 2);
    this.promo.y =  (this.canvas.height / 2);
  
    this.promo.getChildByName("close").onclick = () => {
      this.promo.destroy();
    };

  }

  if(access) this.nameBox.getChildByName("name").value = window.localStorage.getItem("oldName")  ?  window.localStorage.getItem("oldName") : "";
  else this.nameBox.getChildByName("name").value = "";

  
  this.done = false;
  this.text = this.add.text(this.canvas.width/2, 0, "Swordbattle.io", {
    fontSize: "64px",
    fill: "#000000"
  }).setOrigin(0.5);


  this.settingsBtn = new Button(this,0, 0,"Settings","20px","#00FFFF", () => {
    alert("clicked!")
  } )


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
   this.callback(myName, this.music, this.secret);

   console.log("Preroll Ad Completed: " + evt);
 }
});
});
aiptag.cmd.player.push(()=> { aiptag.adplayer.startPreRoll(); 
});
}  else {
this.nameBox.destroy();

this.callback(myName, this.music, this.secret);
}
   } else {    

         this.nameBox.destroy();
        this.callback(myName, this.music, this.secret);
   }
    }
  };

  var go2 = () => {
    if(this.promo && this.promo.visible) {
      this.promo.destroy();
    } else if(this.login && this.login.visible) {
      this.login.getChildByName("login").click();
    }  else if(this.signup && this.signup.visible) {
      this.signup.getChildByName("signup").click();
    } else if(this.nameBox.getChildByName("btn").disabled) {
    } else go();
  };
  this.nameBox.getChildByName("btn").onclick = () => {
   go2();
  };
  this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false);
  this.returnKey.on("down", event => {
    go2();
  });

  var loggedIn = false;
  this.secret = undefined;

  const login = (secret) => {
   this.nameBox.getChildByName("btn").innerHTML = "Connecting..";
    this.nameBox.getChildByName("btn").disabled = true;
    console.log("Attempting to login");
    grecaptcha.ready(() =>{
      grecaptcha.execute("6LdVxgYdAAAAAPtvjrXLAzSd2ANyzIkiSqk_yFpt", {action: "relogin"}).then((thetoken) => {
        axios.post("/api/loginsecret", {
          secret:secret,
          captcha: thetoken
        }).then((res) => {
          if(res.data.error) {
            alert("Login Error: " + res.data.error);

            try {
              if(window.localStorage.getItem("secret")) window.localStorage.removeItem("secret");
            } catch(e) {

            }

            createButtons();
            console.log(res);
            return;
          }
          try {
            window.localStorage.setItem("secret", secret);
          } catch(e) {
            console.log("Failed to save secret");
            console.log(e);
          }
          loggedIn=true;
          this.secret = secret;
          console.log("Logged in");
          if(this.loginButton) this.loginButton.destroy();
          if(this.signupButton) this.signupButton.destroy();
          if(this.nameBox && this.nameBox.visible) {
          this.nameBox.getChildByName("name").value = res.data.username;
          this.nameBox.getChildByName("name").disabled = true;
          this.nameBox.getChildByName("name").classList.add("loggedin");

          this.nameBox.getChildByName("btn").innerHTML = "Play!";
          this.nameBox.getChildByName("btn").disabled = false;

          this.accountData = res.data;
            showLoggedIn();

          }
        }).catch((err) => {
          console.log("Login Error: ");
          console.log(err);
          alert("Failed to login automatically, please try manually.");
        });
      });
    });
  };

  var showLoggedIn = () => {
    
    this.dropdown = this.add.dom(0, 0).createFromCache("dropdown").setOrigin(0);
    document.getElementById("username").innerHTML = this.accountData.username;
    document.getElementById("profile").setAttribute("onclick", `location.href='/${this.accountData.username}'`);
    this.nameBox.getChildByName("name").classList.add("loggedin");
    
    this.nameBox.getChildByName("name").disabled = true;
    document.getElementById("username").style.fontSize = "30px";
    this.dropdown.x = (this.canvas.width/1.2) - (document.getElementById("username").getBoundingClientRect().width);
    this.dropdown.y = -20;
    document.getElementById("logout").onclick = () => {
      this.dropdown.destroy();
      try {
        window.localStorage.removeItem("secret");
      } catch(e) {
        console.log("failed to clear local storage");
      }
      this.secret = undefined;
      this.accountData = undefined;
      loggedIn = false;
      this.nameBox.getChildByName("name").disabled = false;
      this.nameBox.getChildByName("name").classList.remove("loggedin");
      this.nameBox.getChildByName("name").value = "";
      try {
        window.localStorage.removeItem("oldName");
      } catch(e) {
        console.log("failed to clear local storage oldname");
      }

      createButtons();
      resize();
    };


  };

  var createButtons = () => {
    if(loggedIn) return;
  this.loginButton = new ImgButton(this, this.canvas.width-(this.canvas.width > 610? 300: 100), 0, "loginbtn",  ()=>{
    if(this.promo && this.promo.visible) return;
    if(this.signup && this.signup.visible) return;
    if(this.login && this.login.visible) return;
    this.login = this.add.dom(0, 0).createFromCache("login");

    this.login.x = (this.canvas.width / 2);
    this.login.y =  (this.canvas.height / 2);
  
    this.login.getChildByName("close").onclick = () => {
      this.login.destroy();
    };
    this.login.getChildByName("login").onclick = () => {
      grecaptcha.ready(() =>{
        grecaptcha.execute("6LdVxgYdAAAAAPtvjrXLAzSd2ANyzIkiSqk_yFpt", {action: "login"}).then((thetoken) => {
  
try {
      var username = this.login.getChildByName("username").value;
      var password = this.login.getChildByName("password").value;
      if(username.trim() == "" || password == "") return;
      this.login.getChildByName("login").innerHTML = "Logging in..";
      this.login.getChildByName("login").disabled = true;
      this.login.getChildByName("close").disabled = true;
      axios.post("/api/login", {
        username: username,
        password: password,
        captcha: thetoken
      }).then((res) => {
        if(res.data.error) {
          alert(res.data.error);
          this.login.getChildByName("login").disabled = false;
          this.login.getChildByName("close").disabled = false;
          this.login.getChildByName("login").innerHTML = "Login";
        } else {
          
          this.login.getChildByName("login").disabled = false;
          this.login.getChildByName("close").disabled = false;
          this.login.getChildByName("login").innerHTML = "Login";
          
          this.login.destroy();
          try {
            login(res.data.secret);
          } catch(e) {
            console.log("Failed to login");
            console.log(e);
          }
        }

      
      }).catch((err) => {
        alert("Unexpected error, please try again later");
        console.log(err);
        this.login.getChildByName("login").disabled = false;
        this.login.getChildByName("close").disabled = false;
        this.login.getChildByName("login").innerHTML = "Login";

      });
    } catch(e) {
      console.log(e);
    }
    });
    
  });
    };
    
  });
  this.signupButton = new ImgButton(this, this.canvas.width-(this.canvas.width > 610? 300: 100), 0, "signupbtn",  ()=>{
    if(this.promo && this.promo.visible) return;
    if(this.signup && this.signup.visible) return;
    if(this.login && this.login.visible) return;
    this.signup = this.add.dom(0, 0).createFromCache("signup");

    this.signup.x = (this.canvas.width / 2);
    this.signup.y =  (this.canvas.height / 2);
  
    this.signup.getChildByName("close").onclick = () => {
      this.signup.destroy();
    };
    this.signup.getChildByName("signup").onclick = () => {
      grecaptcha.ready(() =>{
        grecaptcha.execute("6LdVxgYdAAAAAPtvjrXLAzSd2ANyzIkiSqk_yFpt", {action: "signup"}).then((thetoken) => {
  
try {
      var username = this.signup.getChildByName("username").value;
      var password = this.signup.getChildByName("password").value;
      var email = this.signup.getChildByName("email").value;
      if(username.trim() == "" || password == "") return;
      this.signup.getChildByName("signup").innerHTML = "Signing up..";
      this.signup.getChildByName("signup").disabled = true;
      this.signup.getChildByName("close").disabled = true;
      axios.post("/api/signup", {
        username: username,
        password: password,
        email: email,
        captcha: thetoken
      }).then((res) => {
        if(res.data.error) {
          alert(res.data.error);
          this.signup.getChildByName("signup").disabled = false;
          this.signup.getChildByName("close").disabled = false;
          this.signup.getChildByName("signup").innerHTML = "Sign Up";
        } else {
          this.signup.getChildByName("signup").disabled = false;
          this.signup.getChildByName("close").disabled = false;
          this.signup.getChildByName("signup").innerHTML = "Sign Up";
          this.signup.destroy();
          try {
            login(res.data.secret);
          } catch(e) {
            console.log("Failed to login");
            console.log(e);
          }
        }

      
      }).catch((err) => {
        alert("Unexpected error, please try again later");
        console.log(err);
        this.login.getChildByName("login").disabled = false;
        this.login.getChildByName("close").disabled = false;
        this.login.getChildByName("login").innerHTML = "Login";

      });
    } catch(e) {
      console.log(e);
    }
    });
    
  });
    };
    
  });
  this.loginButton.btn.setScale(0.25);
  this.signupButton.btn.setScale(0.25);
};
  try {
   var secret = window.localStorage.getItem("secret");
    if(secret && !this.accountData)  {
      login(secret);
    }
    else if(secret && this.accountData) {
      this.secret = this.accountData.secret;
      showLoggedIn();
    }
    else createButtons();
  } catch(e) {
    console.log("failed to autologin");
    console.log(e);
  }


  //this.stats.y -= this.stats.height
  
  const resize = (when=false)=>{
    
    this.game.scale.resize(this.canvas.width, this.canvas.height);
  
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;
  
    
    this.background.setScale(Math.max(cameraWidth / this.background.width, cameraHeight / this.background.height));

    this.background.x = 0 - ((this.background.displayWidth - cameraWidth)/2);
    this.nameBox.x = this.canvas.width / 2;
    this.text.x = this.canvas.width / 2;
   
  this.settingsBtn.setFontSize(clamp(this.canvas.width/20,20,40))

    var scale = 0.17;
    if(this.canvas.width < 950) {
      scale-=0.035;
    }
    if(this.canvas.width < 870) {
      scale-=0.025;
    }
    if(this.canvas.width < 750) {
      scale-=0.015;
    }
    if(this.canvas.width < 610) {
      scale-=0.015;
    }
    if(this.canvas.width < 500) {
      scale-=0.0035;
    }
  
    if(this.loginButton) this.loginButton.btn.setScale(scale);
    if(this.signupButton) this.signupButton.btn.setScale(scale);
    if(this.loginButton ) this.loginButton.update(this.canvas.width-(this.loginButton.btn.displayWidth), 0);
    if(this.signupButton ) this.signupButton.update(this.canvas.width-(this.signupButton.btn.displayWidth), this.loginButton.btn.displayHeight+10);
    

    if(this.dropdown && this.dropdown.visible) { this.dropdown.x = (this.canvas.width/1.2) - (document.getElementById("username").getBoundingClientRect().width);
  }
  
  if(this.scene.isActive("title")) {
    if((this.promo && this.promo.visible) || (this.signup && this.signup.visible) || (this.login && this.login.visible)) {
    } else {
      this.footer.destroy();
   this.footer = this.add.dom(this.canvas.width/2, this.canvas.height).createFromCache("footer").setOrigin(0.5).setScale(this.mobile?1:2);  
    }
  }
  var footery =this.canvas.height - (this.footer.height);
    if(this.canvas.height < 384) footery = this.canvas.height - (this.footer.height / 2);
    if(this.footerdone) this.text.y = this.canvas.height / 4;
    if(this.footerdone) this.footer.y = footery;
    
      
    if(this.text.visible) this.text.setFontSize( this.canvas.width /13);
 
    this.footer.x = this.canvas.width/2;

    if(this.promo && this.promo.visible) {
      this.promo.x = this.canvas.width/2;
      this.promo.y = this.canvas.height/2;
    }

    if(this.login && this.login.visible) {
      this.login.x = this.canvas.width/2;
      this.login.y = this.canvas.height/2;
    }

    if(this.signup && this.signup.visible) {
      this.signup.x = this.canvas.width/2;
      this.signup.y = this.canvas.height/2;
    }
 
  };

    window.addEventListener("resize", resize, false);

resize(true);
    



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