import HealthBar from "./components/HealthBar.js";
import ImgButton from "./components/PhaserImgButton";
import { subscribe, isSupported } from "on-screen-keyboard-detector";
import ClassPicker from "./components/ClassPicker.js";
import {locations} from "./bushes.json";
import Phaser from "phaser";
import {CAPTCHASITE,localServer} from "./../config.json";

import io from "./Io.js";

class GameScene extends Phaser.Scene {
	constructor(callback) {
		super();
		this.callback = callback;
	
	}

	preload() {    
		window.onbeforeunload = confirmExit;
		function confirmExit(e) {
			e.preventDefault();
			return "You are in game.. Do you really want to leave?";
		}
		try {       
			document.getElementsByClassName("grecaptcha-badge")[0].style.opacity = 0;
		} catch(e) {
			console.log(e);
		}
		this.ready = false;
		this.loadrect = this.add.image(0, 0, "opening").setOrigin(0).setScrollFactor(0, 0).setScale(2).setDepth(200);
  
		const cameraWidth = this.cameras.main.width;
		const cameraHeight = this.cameras.main.height;
	  
		
		this.loadrect.setScale(Math.max(cameraWidth / this.loadrect.width, cameraHeight / this.loadrect.height));
	
		this.loadrect.x = 0 - ((this.loadrect.displayWidth - cameraWidth)/2);
		this.loadtext= this.add.text(this.canvas.width/2, this.canvas.height/2, "Connecting...", {fontFamily: "Arial", fontSize: "32px", color: "#ffffff"}).setOrigin(0.5).setScrollFactor(0, 0).setDepth(200);
		this.ping = 0;

	}

	create() {
		var map = 15000;
		this.failedLoads = [];

        this.levels = [];

				if(this.mobile) {
					this.gamePoint = {x: 0, y: 0};
					this.input.on("pointermove", (pointer) => {
						if(this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return;
						this.gamePoint = {x: pointer.x, y: pointer.y};
					});
				}
    
		//recaptcha
		grecaptcha.ready(() =>{
			grecaptcha.execute(CAPTCHASITE, {action: "join"}).then((thetoken) => {

				this.readyt = true;
				this.openingBgm.stop();
				var config =  {
					mute: false,
					volume: 1,
					rate: 1,
					detune: 0,
					seek: 0,
					loop: false,
					delay: 0
				};

				if(this.options.sound == "normal") {
					config.volume = 0.5;
				  } else if(this.options.sound == "high") {
					config.volume = 1;
				  }  else if(this.options.sound == "low") {
					config.volume = 0.2;
				  } else if(this.options.sound == "off") {
					config.volume = 0;
				  } else {
					config.volume = 0.5;
				  }

				this.coin = this.sound.add("coin", config);
				this.chestOpen = this.sound.add("chestOpen", config);
				this.chestHit = this.sound.add("chestHit", config);
				this.damage = this.sound.add("damage", config);
				this.hit = this.sound.add("hit", config);
				this.winSound = this.sound.add("winSound", config);
				this.loseSound = this.sound.add("loseSound", config);
    
				this.tps = 0;
				//background
				this.background = this.add.tileSprite(0, 0, this.canvas.width, this.canvas.height, "background").setOrigin(0).setDepth(2);
				this.background.fixedToCamera = true;

				//player 
        
				this.meSword = this.add.image(400, 100, "sword").setScale(0.25).setDepth(50).setAlpha(0.5);
				this.mePlayer = this.add.image(400, 100, "player").setScale(0.25).setDepth(51).setAlpha(0.5);
				this.meChat = this.add.text(0,0,"", {
					fontFamily: "Georgia",
				}).setOrigin(0.5).setDepth(71);
				this.meChatTween = undefined;
				this.swordAnim = {go: false, added: 0};
				this.myObj = undefined;




				//killcounter
				
				try { 
				this.killCount = this.add.rexBBCodeText(15, 10, "Stabs: 0", {
					fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif",
				}).setFontSize(40).setDepth(101);
				this.killCount.addImage("coin", {
					key: "coin",
					width: 45,
					height: 45
				});
				this.killCount.addImage("kill", {
					key: "kill",
					width: 45,
					height: 45
				});
				
				this.killCount.setScrollFactor(0);

		

				//player+fpscounter

					this.playerCount = this.add.text(0, 0, "Players: 0" + (!this.mobile ? "\nFPS: 0\nTPS: 0\nPing: 0 ms":""), {
						fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif",
						align: "right"
					}).setFontSize(20).setDepth(101).setOrigin(1);
					this.playerCount.setScrollFactor(1);

					//leaderboard
					this.leaderboard = this.add.rexBBCodeText(0, 10, "", {
					fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif",
				}).setFontSize(20).setDepth(101);


				
					
					this.leaderboard.setScrollFactor(0);
				} catch(e) {
					console.log(e);
				}
				//minimap
				const convert = (num, val, newNum) => (newNum * val) / num;
				this.miniMap = {people: [], scaleFactor: convert(1189, 96, this.canvas.width), square: undefined};
				this.miniGraphics = this.add.graphics().setDepth(100);
        
				var padding = 13;
				this.miniMap.scaleFactor = convert(1189, 96, this.canvas.width);
				this.miniGraphics.x = this.canvas.width - ((this.miniMap.scaleFactor * 2) + padding);
				this.miniGraphics.y = this.canvas.height - ((this.miniMap.scaleFactor * 2) + padding);
				this.miniGraphics.lineStyle(5, 0xffff00, 1);
				this.miniGraphics.strokeRoundedRect(0, 0, this.miniMap.scaleFactor * 2,  this.miniMap.scaleFactor * 2, 0);

				this.abilityButton = this.add.image((this.canvas.width /5), (this.canvas.height /5)*4, "abilityBtn").setDepth(101).setScale(0.9).setVisible(false);
				this.abilityButton.setInteractive();
				this.abilityButton.on("pointerdown", () => {
					this.socket.send("ability", []);
				});
				this.ability = this.add.text(this.abilityButton.x, this.abilityButton.y-100, "").setDepth(101).setVisible(false).setFontSize(50).setFontFamily("Georgia, \"Goudy Bookletter 1911\", Times, serif").setOrigin(0.5);


        
				this.cameras.main.ignore([this.miniGraphics, this.abilityButton, this.ability]);

				//
				//joystick
				if(this.mobile && this.options.movementMode == "keys") {
					this.joyStick = this.plugins
						.get("rexvirtualjoystickplugin")
						.add(this, {
							x: this.canvas.width / 6,
							y: this.canvas.height - this.canvas.height / 2.5,
							radius: convert(2360, 250, this.canvas.width),
							base: this.add.circle(0, 0, convert(2360, 250, this.canvas.width), 0x888888),
							thumb: this.add.circle(0, 0, convert(2360, 100, this.canvas.width), 0xcccccc)
							// dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
							// forceMin: 16,
							// enable: true
						});
						this.cameras.main.ignore(this.joyStick.base);
						this.cameras.main.ignore(this.joyStick.thumb);

				}
      
				//bar
				this.meBar = new HealthBar(this, 0, 0, 16, 80);
				this.meBar.bar.setAlpha(0.5);
				this.meBar.bar.setDepth(71);

				//levelbar
				this.lvlBar = new HealthBar(this, 0, 0, 0, 0, true);
				var padding = (this.canvas.width / 2);
				this.lvlBar.x = padding / 2;

				this.lastKill = Date.now();
				this.streak = 0;
				this.killtxts = [];

				this.lvlBar.width = this.canvas.width- padding;
				this.lvlBar.height = this.canvas.height / 30;
				this.lvlBar.y = this.canvas.height - this.lvlBar.height - (this.canvas.height / 40);

				this.lvlBar.draw();

				//chat
				this.chat = {
					obj: null,
					toggled: false,
					btn: new ImgButton(this, 0, 0, "chatbtn", () => {
						
					if(this.loadtext.visible) return;
					this.chat.toggled = !this.chat.toggled;
          if(this.spectating) {
			  if(this.deadText.visible) {
                       this.callback();
                    this.socket.disconnect();
          this.scene.start("title");
			  }
            
          }
		  if(this.spectating) return;
				 if(this.chat.toggled) {
						
						this.chat.obj = this.add.dom(this.canvas.width / 2, (this.canvas.height / 2)-this.canvas.height/5).createFromCache("chat");
						//set focus to chat
						this.chat.obj.getChildByID("chat").focus();
						if (isSupported()) {
							const unsubscribe = subscribe(visibility => {
								if (visibility === "hidden") {
									
									this.chat.toggled = false;
									this.chat.obj.destroy();
								
									unsubscribe();
								}
							});
							
							// After calling unsubscribe() the callback will no longer be invoked.
						   
						}
            
					} else {

						if(this.chat.obj) {
							
							var msg = this.chat.obj.getChildByID("chat").value.trim();
							if(msg.length > 0) this.socket.send("chat", msg);

						this.chat.obj.destroy();
						}
					}
					}),
				};
				this.throwBtn = new ImgButton(this, 0, 0, "throwbtn", () => {
					this.socket.send("throw", []);
					var curPointer = this.gamePoint;
					setTimeout(() => {
						this.gamePoint = curPointer;
					},100 );
				});
				this.chat.btn.btn.setScale(Math.min(this.canvas.height / 1000, this.canvas.width / 1500));
				this.chat.btn.btn.x = this.killCount.width;
				
	


				if(!this.mobile) {
					this.chat.btn.destroy();
					this.throwBtn.destroy();
				} else {
					this.cameras.main.ignore(this.chat.btn.btn);
					this.cameras.main.ignore(this.throwBtn.btn);
				}
				

				//coins array
				this.coins = [];
				this.chests = [];
				// this.lastMove = Date.now()
				this.flyingSwords = new Map();
				this.flyingSwordsData = new Map();
				//enemies array
				this.enemies = [];
				this.dead = false;
				this.spectating = false;
				//arrow keys
				var KeyCodes = Phaser.Input.Keyboard.KeyCodes;
				this.cursors = this.input.keyboard.addKeys({
					up: KeyCodes.UP,
					down: KeyCodes.DOWN,
					left: KeyCodes.LEFT,
					right: KeyCodes.RIGHT,
					enter: KeyCodes.ENTER,
					esc: KeyCodes.ESC,
				}, false);

				this.cursors.esc.on("down", () => {
					if(this.chat.toggled) {
						this.chat.obj.destroy();
						this.chat.toggled = false;
					}
				});
				this.cursors.enter.on("down", () => {
        
					if(this.loadtext.visible) return;
					this.chat.toggled = !this.chat.toggled;
          if(this.spectating) {
			  if(this.deadText.visible) {
                       this.callback();
                    this.socket.disconnect();
          this.scene.start("title");
			  }
            
          }
		  if(this.spectating) return;
				 if(this.chat.toggled) {
						
						this.chat.obj = this.add.dom(this.canvas.width / 2, (this.canvas.height / 2)-this.canvas.height/5).createFromCache("chat");
						//set focus to chat
						this.chat.obj.getChildByID("chat").focus();
            
					} else {

						if(this.chat.obj) {
							
							var msg = this.chat.obj.getChildByID("chat").value.trim();
							if(msg.length > 0) this.socket.send("chat", msg);

						this.chat.obj.destroy();
						}
					}
				});
				//lvl text
				try {
				this.lvlText = this.add.text(this.canvas.width / 2, this.canvas.height / 5,  "", { fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif" }).setFontSize(convert(1366, 75, this.canvas.width)).setDepth(75).setAlpha(0).setOrigin(0.5);
				this.lvlTextTween = undefined;

				this.lvlState = this.add.text(this.canvas.width / 2, this.lvlBar.y - (this.lvlBar.height),  "", { fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif" }).setFontSize(convert(1366, 50, this.canvas.width)).setDepth(75).setAlpha(1).setOrigin(0.5);
				this.lvlState.y = this.lvlBar.y - (this.lvlState.height / 2);
				} catch(e) {
					console.log(e);
				}
				//camera follow
				this.cameras.main.setZoom(1);
        
				this.classPicker = new ClassPicker(this);
        
				this.UICam = this.cameras.add(this.cameras.main.x, this.cameras.main.y, this.canvas.width, this.canvas.height);
				this.cameras.main.ignore([ this.killCount, this.playerCount, this.leaderboard,this.lvlBar.bar, this.lvlText, this.lvlState]);
			// this.cameras.main.ignore([ this.killCount, this.playerCount, this.leaderboard,this.lvlBar.bar, this.lvlText, this.lvlState ]);
			this.UICam.ignore([this.mePlayer, this.meBar.bar, this.meSword, this.background, this.meChat]);
				this.cameras.main.startFollow(this.mePlayer,true);

				//bushes
				this.bushes = [];

				locations.forEach((l,i) => {
          if(i%2==0) return;
					this.bushes.push(this.add.image(l.x, l.y, "bush").setScale(l.scale).setDepth(70));
					this.UICam.ignore(this.bushes[this.bushes.length-1]);
				});
				


				this.input.addPointer(3);
				///resize dynamicly
				const resize = () => {
					if(!this.scene.isActive("game")) return;
					try {

						this.game.scale.resize( this.canvas.width,  this.canvas.height);
						this.lvlText.y = this.canvas.height / 5;
						this.lvlText.x = this.canvas.width  /2;
						this.abilityButton.setPosition((this.canvas.width /5), (this.canvas.height / 5)*4);
						this.ability.setY(this.abilityButton.y - 100);
						if(this.classPicker.shown) this.classPicker.draw(this);
						if(this.mobile && this.options.movementMode =="keys") {

							this.joyStick.x = this.canvas.width / 8;
							this.joyStick.y = this.canvas.height - this.canvas.height / 2.5;
							this.joyStick.base.radius = convert(2360, 250, this.canvas.width);
							this.joyStick.thumb.radius = convert(2360, 100, this.canvas.width);
							this.joyStick.radius = convert(2360, 250, this.canvas.width);
						}
						
						//clear minimap players
						this.miniMap.people.forEach((p) => {
							p.circle.destroy();
						});
						this.miniMap.people = [];

						this.UICam.x = this.cameras.main.x;
						this.UICam.y = this.cameras.main.y;
						this.chat.btn.btn.setScale((Math.min(this.canvas.height / 1000, this.canvas.width / 1500)));
						this.chat.btn.btn.x = this.killCount.width;
						this.miniGraphics.clear();
						var padding = 13;
						this.miniMap.scaleFactor = convert(1189, 96, this.canvas.width);
						this.miniGraphics.x = this.canvas.width - ((this.miniMap.scaleFactor * 2) + padding);
						this.miniGraphics.y = this.canvas.height - ((this.miniMap.scaleFactor * 2) + padding);
						this.miniGraphics.lineStyle(5, 0xffff00, 1);
						this.miniGraphics.strokeRoundedRect(0, 0, this.miniMap.scaleFactor * 2,  this.miniMap.scaleFactor * 2, 0);


						this.background.width = this.canvas.width;
						this.background.height =  this.canvas.height;

						
            
						padding = (this.canvas.width / 2);
						if(this.spectating) {
				          function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
  
    return (hours == "00"?"": hours+"h ") + (minutes == "00"?"": minutes+"m ") + seconds+"s";
  }

							this.deathRect.destroy();
							this.deathRect = this.add.rectangle(this.canvas.width/2, this.canvas.height/2, this.canvas.width/2, this.canvas.height/1.5, 0x90EE90);
              this.deadText.destroy();
				this.deadText = this.add.text(this.canvas.width/2, (this.deathRect.y- (this.deathRect.height/2)), "You got stabbed", {fontFamily: "Arial", fontSize: "32px", color: "#000000"}).setOrigin(0.5);
								this.deadText.setFontSize(Math.min(this.canvas.width/25,this.canvas.height/20));
								this.deadText.y += this.deadText.height;
								
								var msgs = ["Nooooooooo", "Rest in peace", "You can do better!", "Practice makes perfect!", "Keep trying!"];
								var msg = msgs[Math.floor(Math.random() * msgs.length)];
              this.dataText.destroy();
								this.dataText = this.add.text(this.canvas.width/2, this.deadText.y, msg, {fontFamily: "Arial", fontSize: "32px", color: "#000000"}).setOrigin(0.5);
								this.dataText.setFontSize(Math.min(this.canvas.width/40, this.canvas.height/30));
							this.dataText.y += this.dataText.height*1.5;	

              this.statsText.destroy();
              					this.statsText = this.add.text(this.canvas.width/2, this.dataText.y, "Stabbed By: "+this.dtas.killedBy+"\nCoins: "+this.myObj.coins+"\nKills: "+this.myObj.kills+"\nSurvived: "+msToTime(this.dtas.timeSurvived), {fontFamily: "Arial", fontSize: "32px", color: "#000000"}).setOrigin(0.5);
								this.statsText.setFontSize(Math.min(this.canvas.width/35, this.canvas.height/25));
							this.statsText.y += this.statsText.height;
						this.playAgain.destroy();
                  this.playAgain = new ImgButton(this, 0,0, "playAgainBtn",()=>{
                    this.callback();
                    this.socket.disconnect();
          this.scene.start("title");
      });this.playAgain.btn.setScale(Math.min(this.canvas.width/6533.33333333,this.canvas.height/5532.33333333));
 
              this.playAgain.btn.y = this.statsText.y + this.statsText.displayHeight;
              this.playAgain.btn.x = this.canvas.width/2;
              this.playAgain.btn.x -= this.playAgain.btn.displayWidth/2;
               
                                                                                                                                                                                                                                          
            }
            if(this.spectating) return;

						this.lvlBar.x = padding / 2;
                
						this.lvlBar.width = this.canvas.width- padding;
						this.lvlBar.height = this.canvas.height / 30;
						this.lvlBar.y = this.canvas.height - this.lvlBar.height - (this.canvas.height / 40);
						this.lvlBar.draw();

						this.lvlState.x = this.canvas.width / 2;
					
						this.lvlState.setFontSize(convert(1366, 50, this.canvas.width));
						this.lvlState.y = this.lvlBar.y - (this.lvlState.height /2);

						this.playerCount.x = this.miniGraphics.x + (this.miniMap.scaleFactor * 2 );
						this.playerCount.y = this.canvas.height - (this.miniMap.scaleFactor * 2 ) - 17;

						this.lvlText.setFontSize(convert(1366, 75, this.canvas.width));
            
					} catch(e) {
						console.log(e);
					}
				};

				var doit;

				window.addEventListener("resize", function(){
					clearTimeout(doit); 
					doit = setTimeout(resize, 100);
				  });
				//go packet
				var server = this.options.server == "eu1" ? "wss://swordbattle.herokuapp.com" : this.options.server == "us2" ? "wss://swordbattle2.herokuapp.com" : "wss://sword-io-game.herokuapp.com";
				// server = undefined; // Enable for localhost/development
				function isPrivateIP(ip) {
					//remove port if present
					if (ip.indexOf(":") > -1) {
						ip = ip.split(":")[0];
					}

					var parts = ip.split(".");
					return parts[0] === "10" || 
						 (parts[0] === "172" && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) || 
						 (parts[0] === "192" && parts[1] === "168");
			 }
				this.socket = io(localServer?document.location.host.includes("localhost")  ? "ws://localhost:3000" : (isPrivateIP(document.location.host) ? "ws://"+document.location.host : "wss://"+document.location.host):server);
			
				var showed = false;
				function handleErr(err) {
					if(showed) return;
					console.log(err);
					document.write("<b>Failed to contact the server, try a different server from settings (bottom left)</b><br><br><button onclick=\"location.reload()\"><h1>Refresh</h1></button>");
					showed = true;
				}
				this.socket.on("connect_error", (e) => {
          if(!this.spectating) {
            handlErr(e);
          }
        });
				this.socket.on("ban",handleErr);

				this.socket.on("connected", ()=>{
					// alert("Connected to server!");
				if(!this.secret) this.socket.send("go", [this.name, thetoken, false, this.options]);
				else this.socket.send("go", [this.secret, thetoken, true,this.options]);
				//mouse down

				

				const mouseDown = (pointer) => {
					if(this.mobile && this.joyStick &&this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return;
			
					if (!this.mouseDown) {
						if(pointer) {
						this.gamePoint = {x: pointer.x, y: pointer.y};
						}
						this.mouseDown = true;
						this.socket.send("mouseDown", true);

					}
				};

				const mouseUp = (pointer) => {
					if(this.mobile && this.joyStick && this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return;
				
					if (this.mouseDown) {
						if(pointer) {
							this.gamePoint = {x: pointer.x, y: pointer.y};
							}
						this.mouseDown = false;
						this.socket.send("mouseDown", false);
					}
				};
				
					this.input.keyboard.on("keydown-SPACE", () => {
						if(this.chat.toggled) return;
						mouseDown();
					}, this);
						
					this.input.keyboard.on("keyup-SPACE", () => {
						mouseUp();
					}, this);
				this.input.on("pointerdown", function (pointer) {
					if(pointer.rightButtonDown() && this.meSword.visible) this.socket.send("throw", []);
					else mouseDown(pointer);
					
				}, this);
				this.input.on("pointerup", function (pointer) {
						mouseUp(pointer);
				}, this);

			

			


				this.socket.on("tps", (tps) => {
					this.tps = tps;


				});
				this.socket.on("ping", (ping) => {
					this.ping = ping;
					this.socket.send("pong", []);

				});
				this.socket.on("ban", (data) => {
					showed = true;
					document.write(data);
				});

				//boundary
				this.graphics = this.add.graphics().setDepth(4);
				var thickness = 5000;
				this.graphics.lineStyle(thickness, 0x006400, 1);

				this.graphics.strokeRoundedRect(-(map/2) - (thickness/ 2), -(map/2) - (thickness/ 2), map + thickness, map + thickness, 0 );

				this.graphics.lineStyle(10, 0xffff00, 1);

				this.graphics.strokeRoundedRect(-(map/2), -(map/2), map, map, 0);


				//server -> client

                this.socket.on("levels", (l)=>this.levels=l);
								this.socket.on("flyingSwords", (swords) => {
			
									swords.forEach((sword) => {
										if(!this.flyingSwords.has(sword.id)) {
											var ability = false;
											if(this.myObj && sword.id == this.myObj.id && this.myObj.abilityActive) ability = true;
											else {
												var owner = this.enemies.find(e=>e.playerObj.id == sword.id);
												if(owner && owner.playerObj.abilityActive) ability = true;
											}
											sword.ability = ability;
											this.flyingSwords.set(sword.id, sword);
											var newSword = this.add.image(sword.x, sword.y, sword.skin+"Sword").setDepth(21).setScale(sword.scale);
											newSword.setAngle(sword.angle);

											this.UICam.ignore(newSword);
											this.flyingSwordsData.set(sword.id, newSword);
										} else {

											var oldSword = this.flyingSwordsData.get(sword.id);
											var obj = this.flyingSwords.get(sword.id);
										
											this.tweens.add({
												targets: oldSword,
												x: sword.x,
												y: sword.y,
												duration: 1000/30,
												ease: "Linear",
											});

											if(obj.ability) {
												var particles = this.add.particles("starParticle");

												var emitter = particles.createEmitter({
													
													maxParticles: this.sys.game.loop.actualFps >= 60 ? 3 : this.sys.game.loop.actualFps >= 30 ? 2 : 1,
													scale: 0.05
												});
												function getRandomInt(min, max) {
													min = Math.ceil(min);
													max = Math.floor(max);
													return Math.floor(Math.random() * (max - min + 1)) + min;
												}
												emitter.setPosition(oldSword.x + getRandomInt(-10, 10), oldSword.y + getRandomInt(-10, 10));
											
												this.UICam.ignore(particles);
												emitter.setSpeed(200);
												particles.setDepth(105);
										
										}
									}
									});
									this.flyingSwordsData.forEach((sword, id) => {
										if(!swords.find((s) => s.id == id)) {
											this.flyingSwordsData.delete(id);
											this.flyingSwords.delete(id);
											sword.destroy();
										}
									});
								

								});
								this.socket.on("ability", (e) => {
								//	console.log(e);
									var [cooldown, duration, now] = e;
									
									duration -= Date.now() - now;
									
									this.tweens.addCounter({
										from: 0,
										to: (duration+cooldown)/1000,
										duration: duration+cooldown,
										onUpdate: (tween) => {
									var left = Math.abs(tween.getValue() - (duration+cooldown)/1000);
								//	console.log(left - ((duration/1000) + (cooldown/1000)));
									if(left - (cooldown/1000) >= 0) {
										//still going
										this.ability.visible=true;
										this.ability.setText((left-(cooldown/1000)).toFixed(1));
									} else if(cooldown/1000 >= left) {
										//cooldown
										this.abilityButton.visible = false;
										
										this.ability.setText((left).toFixed(1));
									} else {
										this.abilityButton.visible = true;
										
									}
										},
										onComplete: () => {
											this.ability.setText("");
										}
									});
								});

				const addPlayer = (player) => {
					if (this.enemies.filter(e => e.id === player.id).length > 0) return;
					/* vendors contains the element we're looking for */

					var enemy = {
						id: player.id,
						down: false,
						playerObj: undefined,
						lastTick: Date.now(),
						sword: this.add.image(player.pos.x, player.pos.y, "playerSword").setScale(0.25).setDepth(49),
						player: this.add.image(player.pos.x, player.pos.y, "playerPlayer").setScale(0.25).setDepth(49),
						bar: new HealthBar(this, player.pos.x, player.pos.y + 55),
						nameTag: this.add.rexBBCodeText(player.pos.x, player.pos.y - 90, `${player.name}`, {
							fontFamily: "serif",
							fill: player.verified?player.name.toLowerCase()=="mitblade" ||player.name.toLowerCase()=="codergautam"||player.name.toLowerCase()=="cosmicwarlord"?"#FF0000":"#0000FF" :"#000000",
							fontSize: "25px"
						}).setDepth(69).setAlpha(player.verified?1:0.5),
						swordAnim: {go: false, added: 0},
						toAngle: 0,
						chatText: this.add.text(0,0, "", {
							fontFamily: "Georgia",
						}).setDepth(71).setOrigin(0.5),
						chatTween: undefined,
					};

					if(!this.textures.exists(player.skin+"Player") ) {
						if(!this.failedLoads.includes(player.skin)){ 
						this.load.image(`${player.skin}Player`, `/assets/images/${player.skin}Player.png`);
						this.load.image(`${player.skin}Sword`, `/assets/images/${player.skin}Sword.png`);

						this.load.once(Phaser.Loader.Events.COMPLETE, () => {
							// texture loaded so use instead of the placeholder
							enemy.player.setTexture(player.skin+"Player");
						enemy.sword.setTexture(player.skin+"Sword");
						});
						this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
							// texture didnt load so use the placeholder
							enemy.player.setTexture("playerPlayer");
						enemy.sword.setTexture("playerSword");
						this.failedLoads.push(player.skin);
						});
						this.load.start();
					} 
						else if(enemy.player.texture != "playerPlayer") {
							enemy.player.setTexture("playerPlayer");
							enemy.sword.setTexture("playerSword");
						
					}

					} else {
						enemy.player.setTexture(player.skin+"Player");
						enemy.sword.setTexture(player.skin+"Sword");
					}
         
					
					var factor = (100/(player.scale*100))*1.5;
       
					enemy.sword.angle = Math.atan2(player.mousePos.y - ((player.mousePos.viewport.height) / 2), player.mousePos.x - ((player.mousePos.viewport.width) / 2)) * 180 / Math.PI + 45;
            
            
					enemy.sword.x = enemy.player.x + enemy.player.width / factor * Math.cos(enemy.sword.angle * Math.PI / 180);
					enemy.sword.y = enemy.player.y + enemy.player.width / factor * Math.sin(enemy.sword.angle * Math.PI / 180);
					enemy.bar.bar.setDepth(69);
          
					this.UICam.ignore([enemy.player, enemy.bar.bar, enemy.sword, enemy.nameTag,enemy.chatText, this.graphics]);
					this.enemies.push(enemy);

					var circle = this.add.circle(0, 0, 10, 0xFF0000);
					this.cameras.main.ignore(circle);
					circle.setDepth(98);
					// this.miniMap.people.push(
					// 	{
					// 		id: player.id,
					// 		circle: circle
					// 	}
					// );

					//check if player joined 5 seconds ago
					if (Date.now() - player.joinTime < 5000) {
						enemy.player.setAlpha(0.5);
						enemy.sword.setAlpha(0.5);
						enemy.bar.bar.setAlpha(0.5);
						//use a tween to make the player a bit transparent for 5 seconds
						setTimeout(() => {
						this.tweens.add({
							targets: [enemy.player, enemy.sword, enemy.bar.bar],
							alpha: 1,
							duration: 100,
							ease: "Linear",
							repeat: 0,
							yoyo: false
						});
					}, 5000 - (Date.now() - player.joinTime));
					}


				};
				this.removePlayer = (id, range = false) => {
					try {
						var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == id);
        
						if(!enemy) return;
						if(range) {
							enemy.player.destroy();
							this.enemies.splice(this.enemies.findIndex(enemy => enemy.id == id), 1);
							enemy.bar.destroy();
							enemy.nameTag.destroy();
							enemy.sword.destroy();
							// var miniMapPlayer = this.miniMap.people.find(x => x.id === id);
							// if(miniMapPlayer) {
							// miniMapPlayer.circle.destroy();
							// this.miniMap.people = this.miniMap.people.filter(p => p.id != id);
							// }
						} else {
						//fade out the enemy using tweens
						var fadeOut = this.tweens.add({
							targets: [enemy.player, enemy.nameTag, enemy.bar.bar, enemy.sword],
							alpha: 0,
							duration: 150,
							ease: "Sine2",
							onComplete: () => {
								enemy.player.destroy();
								this.enemies.splice(this.enemies.findIndex(enemy => enemy.id == id), 1);
								enemy.bar.destroy();
								enemy.nameTag.destroy();
								enemy.sword.destroy();
                // if(!this.spectating) {
								// var miniMapPlayer = this.miniMap.people.find(x => x.id === id);
								// miniMapPlayer.circle.destroy();
								// this.miniMap.people = this.miniMap.people.filter(p => p.id != id);
                // }
							}
						});
					}
        
					} catch (e) {
						console.log(e);
					}
				};


				this.socket.on("players", (players) => {
					players.forEach(player => addPlayer(player));

					this.ready = true;
          
					if(!this.ready) {
						this.ready = true;
          
					}
				});
				this.socket.on("new", (player) => {
					addPlayer(player);
					if(!this.ready) {
						this.ready = true;
           
					}
				});
				this.socket.on("outOfRange", (playerIds) => {
					playerIds.forEach(id => this.removePlayer(id, true));
				});
				this.all = {
					lastUpdate: 0,
					players: []
				};
				this.socket.on("all", (players) => {
					this.all.players = players.filter((p) => p.id != this.socket.id);
					this.all.lastUpdate = Date.now();
					players.forEach(player => {
						if(!this.spectating && player.id != this.socket.id) {
						if(this.miniMap.people.find(x => x.id === player.id)) {

							var miniMapPlayer = this.miniMap.people.find(x => x.id === player.id);





							if(this.enemies.find(x => x.id === player.id) || (miniMapPlayer.circle.x == 0 && miniMapPlayer.circle.y == 0) ) {
								miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / (map/2)) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor;
								miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / (map/2)) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor; 
							} else {
							this.tweens.add({
								targets: miniMapPlayer.circle,
								x: (this.miniGraphics.x + ((player.pos.x / (map/2)) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor,
								y: (this.miniGraphics.y+ ((player.pos.y / (map/2)) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor,
								duration: 1000+this.ping,
								ease: "Sine2"
							});
						}


							var bruh = map / 10000;

							try {
							if(miniMapPlayer && miniMapPlayer.circle && miniMapPlayer.circle?.radius) {
							miniMapPlayer.circle.radius = player.scale * (convert(1280, 15, this.canvas.width)/bruh);
							}
						} catch (e) {
							// I honestly don't know why this is here, but it works so I'm not touching it
						}
						} else {
						this.miniMap.people.push({
							id: player.id,
							circle: this.add.circle(0, 0, 10, 0xFF0000)
						});
					}
				}
					});
                    if(players.length < this.miniMap.people.length) {
          var remaining = this.miniMap.people.filter((p) => !players.find(x => x.id === p.id));
          for (var remain of remaining) {
            remain.circle.destroy();
            this.miniMap.people.splice(this.miniMap.people.findIndex(x => x.id === remain.id), 1);
          }
          }
          
				});
				this.socket.on("me", (player) => {

					if(this.loadrect.visible) { 
						this.load.image(`${player.skin}Player`, `/assets/images/${player.skin}Player.png`);
						this.load.image(`${player.skin}Sword`, `/assets/images/${player.skin}Sword.png`);

	
					 
					 this.load.once(Phaser.Loader.Events.COMPLETE, () => {
						// texture loaded so use instead of the placeholder
						this.loadrect.destroy(); 
						this.loadtext.destroy();
					
					});
					this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
						// texture didnt load so use the placeholder
						this.loadrect.destroy(); 
						this.loadtext.destroy();
					this.failedLoads.push(player.skin);
					});
					this.load.start();
					}
					if(this.levels.length > 0) {
						if(this.myObj?.evolutionQueue) {
							if(this.myObj.evolutionQueue.length > 0) {						
								// console.log(this.myObj.evolutionQueue);
								// console.log(this.classPicker)
								if(!this.classPicker.shown || (this.classPicker.text1 != this.myObj.evolutionQueue[0][0] || this.classPicker.text2 != this.myObj.evolutionQueue[0][1])) {
								this.classPicker.setEvoQueue(this.myObj.evolutionQueue);
									
									this.classPicker.draw(this);
									const emitEvolve = (k)=> {
										this.socket.send("evolve", k);

								this.classPicker.setEvoQueue(this.myObj.evolutionQueue);
										this.classPicker.draw(this);
										this.classPicker.on("class-selected", (k) => {
											emitEvolve(k);
										});
									};
									this.classPicker.on("class-selected", (k) => {
										emitEvolve(k);
									});
								}
								
							} else {
								if(this.classPicker.shown) {
								this.classPicker.clear();
								}
							}
						}
						if(!player.swordInHand) {
							this.meSword.setVisible(false);
							this.throwBtn.btn.setVisible(false);
						}
						else {
							
							this.meSword.setVisible(true);
							this.throwBtn.btn.setVisible(true);
						}

						if(player.level >= this.levels.length  && player.coins >= this.levels[this.levels.length - 1].coins) {
							this.lvlState.setText("Max Level");
							this.lvlBar.setLerpValue(100);
						} else {
                    var diff = this.levels[player.level-1].coins - this.levels[player.level-1].start;
                    var lvlcoins = player.coins - this.levels[player.level-1].start;
                    this.lvlBar.setLerpValue((lvlcoins / diff)*100);

					this.lvlState.setText("Level: " + player.level +" ("+Math.round((lvlcoins/diff)*100)+"%)");

					if(this.myObj && player.level > this.myObj.level) {

						if(this.lvlTextTween) this.lvlTextTween.stop();

						if(!this.lvlText.data) this.lvlText.setData("x", 0);
						this.lvlText.setData("x", this.lvlText.getData("x")+(player.level-this.myObj.level) );
						this.lvlText.setText("Level up!"+(this.lvlText.getData("x") > 1 ? ` x${this.lvlText.getData("x")}` : ""));

						 var completeCallback = () => {
							this.lvlTextTween = this.tweens.add({
								targets: this.lvlText,
								alpha: 0,
								y: this.canvas.height / 5,
								onComplete: () => this.lvlText.setData("x", 0),
								duration: 300,
								ease: "Power2"
							  }, this);
						};
						this.lvlTextTween = this.tweens.add({
							targets: this.lvlText,
							alpha: 1,
							y: this.canvas.height / 4,
							completeDelay: 1000,
							duration: 500,
							onComplete: completeCallback,
							ease: "Power2"
						  }, this);

					  
					}
				}
					}
					if(player.abilityActive && this.sys.game.loop.actualFps > 5) {
						var particles = this.add.particles("starParticle");

						var emitter = particles.createEmitter({
							
							maxParticles: this.sys.game.loop.actualFps >= 60 ? 3 : this.sys.game.loop.actualFps >= 30 ? 2 : 1,
							scale: 0.05
						});
						function getRandomInt(min, max) {
							min = Math.ceil(min);
							max = Math.floor(max);
							return Math.floor(Math.random() * (max - min + 1)) + min;
						}
						emitter.setPosition(this.mePlayer.x+getRandomInt(-0.5*this.mePlayer.displayWidth, this.mePlayer.displayWidth/2),this.mePlayer.y+getRandomInt(-0.5*this.mePlayer.displayHeight, this.mePlayer.displayHeight/2));
					
						this.UICam.ignore(particles);
						emitter.setSpeed(200);
						particles.setDepth(105);
					}
					if((this.mePlayer.texture.key != (player.evolution == "" ? player.skin+"Player" : player.evolution+"Player"))) {
						
						this.meSword.setTexture(player.skin+"Sword");
						if(player.evolution == "") {
						if(!this.textures.exists(player.skin+"Player")) {
							if(!this.failedLoads.includes(player.skin)) {
							this.load.image(`${player.skin}Player`, `/assets/images/${player.skin}Player.png`);
							this.load.image(`${player.skin}Sword`, `/assets/images/${player.skin}Sword.png`);
	
							this.load.once(Phaser.Loader.Events.COMPLETE, () => {
								// texture loaded so use instead of the placeholder
								this.mePlayer.setTexture(player.skin+"Player");
							this.meSword.setTexture(player.skin+"Sword");
							});
							this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
								// texture didnt load so use the placeholder
								this.mePlayer.setTexture("playerPlayer");
							this.meSword.setTexture("playerSword");
							this.failedLoads.push(player.skin);
							});
							this.load.start();
						} else {
							if(this.mePlayer.texture != "playerPlayer") {
							this.mePlayer.setTexture("playerPlayer");
							this.meSword.setTexture("playerSword");
							}
						}
	
						}  else {
							this.mePlayer.setTexture(player.skin+"Player");
							this.meSword.setTexture(player.skin+"Sword");
						}
					} else this.mePlayer.setTexture(player.evolution+"Player");

					
					}

					if(player?.evolution != "" && !this.abilityButton.visible) this.abilityButton.visible = true;
					if(player?.evolution != "" && !this.ability.visible) this.ability.visible = true;

					if (!this.myObj) {
						this.mePlayer.x = player.pos.x;
						this.mePlayer.y = player.pos.y;
					} else {
						this.tweens.add({
						targets: this.mePlayer,
						x: player.pos.x,
						y: player.pos.y,
						duration: 300,
						ease: "Power2"
					});
					}
					this.mePlayer.setScale(player.scale);
					this.meBar.maxValue = player.maxHealth;
					this.meBar.setHealth(player.health);
					// if(this.myObj) console.log( this.cameras.main.zoom+" -> "+this.myObj.coins+" -> "+player.scale)
					
					var show = 1000;
					show += (this.mePlayer.width*this.mePlayer.scale)*5;
					//var oldZoom = this.cameras.main.zoom;
					var newZoom = Math.max(this.scale.width / show, this.scale.height / show);
 					this.cameras.main.setZoom(
						newZoom
					); 
			
	
					this.meSword.setScale(player.scale);
					  this.background.setTileScale(this.cameras.main.zoom, this.cameras.main.zoom);
					this.background.displayWidth = this.cameras.main.displayWidth;
					this.background.displayHeight = this.cameras.main.displayHeight;
		

					this.killCount.setText("[img=kill] " + player.kills+"\n[img=coin] "+player.coins);
					this.myObj = player;

					//minimap
					if(!this.miniMap.people.find(x => x.id === player.id)) {
						var circle = this.add.circle(0, 0, 10, 0xFFFFFF);
						this.cameras.main.ignore(circle);
						circle.setDepth(99);
						this.miniMap.people.push(
							{
								id: player.id,
								circle: circle
							}
						);
					}
					if(!this.spectating) {
					var miniMapPlayer = this.miniMap.people.find(x => x.id === player.id);
            
					miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / (map/2)) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor;
					miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / (map/2)) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor;
					var bruh = map / 10000;
					if(miniMapPlayer && miniMapPlayer.circle && miniMapPlayer.circle?.radius) {
					miniMapPlayer.circle.radius = player.scale * (convert(1280, 15, this.canvas.width)/bruh);
					}	
				}

				});
				this.socket.on("player", (player) => {
					//update player
					if (!this.ready) return;
					try {
               
						var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == player.id);
						if(!enemy) {
							addPlayer(player);
							enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == player.id);
						}

						enemy.lastTick = Date.now();

						enemy.playerObj = player;
						enemy.bar.maxValue = player.maxHealth;
						enemy.bar.setHealth(player.health);

						//update pos
						this.tweens.add({
							targets: enemy.player,
							x: player.pos.x,
							y: player.pos.y,
							duration: 300,
							ease: "Power2"
						});

						//update sword
						var mousePos = player.mousePos;
						enemy.toAngle = Math.atan2(mousePos.y - ((mousePos.viewport.height) / 2), mousePos.x - ((mousePos.viewport.width) / 2)) * 180 / Math.PI + 45;

						enemy.player.setScale(player.scale);
						enemy.sword.setScale(player.scale);
						enemy.down = player.mouseDown;

						if(!player.swordInHand) enemy.sword.setVisible(false);
						else enemy.sword.setVisible(true);

						//skin + evo update
						if((enemy.player.texture.key != (player.evolution == "" ? player.skin+"Player" : player.evolution+"Player"))) {
						
							enemy.sword.setTexture(player.skin+"Sword");
							if(player.evolution == "") {
							if(!this.textures.exists(player.skin+"Player")) {
								if( !this.failedLoads.includes(player.skin)) {
								this.load.image(`${player.skin}Player`, `/assets/images/${player.skin}Player.png`);
								this.load.image(`${player.skin}Sword`, `/assets/images/${player.skin}Sword.png`);
		
								this.load.once(Phaser.Loader.Events.COMPLETE, () => {
									// texture loaded so use instead of the placeholder
									enemy.player.setTexture(player.skin+"Player");
								enemy.sword.setTexture(player.skin+"Sword");
								});
								//load error
								this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
									// texture didnt load so use the placeholder
									enemy.player.setTexture("playerPlayer");
								enemy.sword.setTexture("playerSword");
								this.failedLoads.push(player.skin);
								});
								this.load.start();
							} else if(enemy.player.texture != "playerPlayer") {
								enemy.player.setTexture("playerPlayer");
								enemy.sword.setTexture("playerSword");
							}
		
							}  else {
								enemy.player.setTexture(player.skin+"Player");
								enemy.sword.setTexture(player.skin+"Sword");
							}
						} else enemy.player.setTexture(player.evolution+"Player");
	
						
						}
						//minimap
						if(this.spectating) return;
						// var miniMapPlayer = this.miniMap.people.find(x => x.id === player.id);


						if(player.abilityActive && this.sys.game.loop.actualFps > 5) {
							var particles = this.add.particles("starParticle");
	
							var emitter = particles.createEmitter({
								
								maxParticles: this.sys.game.loop.actualFps >= 60 ? 3 : this.sys.game.loop.actualFps >= 30 ? 2 : 1,
								scale: 0.05
							});
							function getRandomInt(min, max) {
								min = Math.ceil(min);
								max = Math.floor(max);
								return Math.floor(Math.random() * (max - min + 1)) + min;
							}
							emitter.setPosition(enemy.player.x+getRandomInt(-0.5*enemy.player.displayWidth, enemy.player.displayWidth/2),enemy.player.y+getRandomInt(-0.5*enemy.player.displayHeight, enemy.player.displayHeight/2));
						
							this.UICam.ignore(particles);
							emitter.setSpeed(200);
							particles.setDepth(105);
						}
            
        
						if(this.miniMap.people.find(x => x.id === player.id)) {
							var miniMapPlayer = this.miniMap.people.find(x => x.id === player.id);
							miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / (map/2)) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor;
							miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / (map/2)) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor;
							var bruh = map / 10000;
							if(miniMapPlayer && miniMapPlayer.circle && miniMapPlayer.circle?.radius) {

							miniMapPlayer.circle.radius = player.scale * (convert(1280, 15, this.canvas.width)/bruh);
							}
						}

						// miniMapPlayer.cthis.miniMap.people.find(person => person.id == id)?.circle?.destroy();ircle.x = (this.miniGraphics.x + ((player.pos.x / (map/2)) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor;
						// miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / (map/2)) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor;
						// var bruh = map / 10000;
						// miniMapPlayer.circle.radius = player.scale * (convert(1280, 15, this.canvas.width)/bruh);

		

					} catch (e) {
						console.log(e);
					}
				});
				this.socket.on("announcement", (announcement) => {
					alert(announcement);
				});
				this.socket.on("chat", (data) => {
					//do smth
					if(!this.myObj) return;

          if(data.id == this.myObj.id)  {
            this.meChat.setText(data.msg);
			this.meChat.setAlpha(0);

			if(this.meChatTween) this.meChatTween.stop();

			this.meChatTween = this.tweens.add({
				targets: this.meChat,
				duration: 200,
				alpha: 1,
				completeDelay: 2000,
				onComplete: () => {
					this.meChatTween = this.tweens.add({
						targets: this.meChat,
						duration: 200,
						alpha: 0,
						onComplete: () => {
							this.meChat.setText("");
						}
					});

				},
				
				ease: "Power2"
			});

          } else {
			var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == data.id);
			if(!enemy) return;

			enemy.chatText.setText(data.msg);
			enemy.chatText.setAlpha(0);

			if(enemy.chatTween) enemy.chatTween.stop();

			enemy.chatTween = this.tweens.add({
				targets: enemy.chatText,
				duration: 200,
				alpha: 1,
				completeDelay: 2000,
				onComplete: () => {
					enemy.chatTween = this.tweens.add({
						targets: enemy.chatText,
						duration: 200,
						alpha: 0,
						onComplete: () => {
							enemy.chatText.setText("");
						}
					});

				}
			});


		  }


				});
				this.socket.on("playerLeave", this.removePlayer);
				this.socket.on("playerDied", ([id, data]) => {
				//check if killed by me
				this.miniMap.people.find(person => person.id == id)?.circle?.destroy();

				if(this.myObj && data && this.myObj.id === data.killedBy.id) {
					var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == id);
					if(enemy && enemy.playerObj) {
					//i killed them!!
						var fontsize = convert(1366, 64, this.canvas.width);
						if(Date.now() - this.lastKill < 2500) {
							this.streak++;
							var txt = "[b]";
							var list = ["Double", "Triple", "Quadra", "Quinta", "Hexta", "Hepta", "Octa", "Nona", "Deca"];
							if(this.streak-1 > list.length) txt += `x${this.streak}`;
							else txt += list[this.streak-1];
							txt += " Kill![/b]";

							this.killtxts.forEach((i) => {
								i.destroy();
							});
							this.killtxts = [];
						} else {

						this.streak = 0;
					var txt = `[b][color=#e82a1f]Stabbed [/color][color=#0000FF]${enemy.playerObj.name}[/color][/b]`;
						}
					var text = this.add.rexBBCodeText(this.canvas.width/2, this.canvas.height, txt).setOrigin(0.5).setAlpha(0).setFontSize(fontsize);
					text.setData("index", this.killtxts.length);
					this.killtxts.push(text);

						const completeCallback = (text) => {
							this.tweens.add({
								targets: text,
								alpha: 0,
								y: this.canvas.height,
								onComplete: ()=>{
									this.killtxts.slice(text.getData("index"),1);
									text.destroy();
								},
								ease: "Power2",
								duration: 250
							});
						};

					this.tweens.add({
						targets: text,
						alpha: 1,
						y: this.canvas.height - this.canvas.height / 6,
						completeDelay: 250,
						duration: 750,
						onComplete: ()=>completeCallback(text),
						ease: "Bounce"
					  }, this);
					this.cameras.main.ignore(text);
						}
						this.lastKill = Date.now();
				}
				

				this.removePlayer(id);

				});

				this.socket.on("dealHit", ([playerId, pPos]) => {
					var player = this.enemies.find(enemyPlayer => enemyPlayer.id == playerId);
					if(player && this.sys.game.loop.actualFps >= 30) {
						var particles = this.add.particles("hitParticle");

						var emitter = particles.createEmitter({
							
							maxParticles: 5,
							scale: 0.01
						});
						emitter.setPosition(pPos?pPos.x : player.player.x, pPos? pPos.y : player.player.y);
					
						this.UICam.ignore(particles);
						emitter.setSpeed(200);
						particles.setDepth(105);
						emitter.setBlendMode(Phaser.BlendModes.ADD);
					}
					this.hit.play();
				});
				this.socket.on("takeHit", ([playerId, pPos]) => {
					if(this.sys.game.loop.actualFps < 30) return;
					this.damage.play();
					var particles = this.add.particles("hitParticle");

					var emitter = particles.createEmitter({
						
						maxParticles: 5,
						scale: 0.01
					});
					emitter.setPosition(this.mePlayer.x,this.mePlayer.y);
				
					this.UICam.ignore(particles);
					emitter.setSpeed(200);
					particles.setDepth(105);
					//emitter.setBlendMode(Phaser.BlendModes.ADD);
				});

				//coins

				const addCoin = (coin,start) => {
					if(this.dead) return;
					var anim = true;
					if(!start) {
						start = [coin.pos.x, coin.pos.y];
						anim = false;
					}
					
					this.coins.push(
						{
							id: coin.id,
							item: this.add.image(start[0], start[1], "coin").setScale(coin.size/100).setDepth(20).setAlpha(anim?0:1),
							state: {collected: false, collectedBy: undefined, time: 0}
						}
					);
						if(anim) {
							this.tweens.add({
								targets: this.coins[this.coins.length-1].item,
								alpha: 1,
								x: coin.pos.x,
								y: coin.pos.y,
								duration: 250,
								ease: "Sine2"
							});
						}
					this.UICam.ignore(this.coins[this.coins.length - 1].item);
				};
				

				const addChest = (chest,start) => {
					if(this.dead) return;
					var anim = true;
					if(!start) {
						start = [chest.pos.x, chest.pos.y];
						anim = false;
					}
					
					this.chests.push(
						{
							id: chest.id,
							maxHealth: chest.maxHealth,
							health: chest.health,
							item: this.add.image(start[0], start[1], chest.rarity=="normal"?"chest":chest.rarity+"Chest").setScale(chest.scale).setDepth(21).setAlpha(anim?0:1).setOrigin(0),
							healthBar: chest.rarity != "normal"?new HealthBar(this, start[0], start[1], 100, 25):undefined,
						}
					);

					if(chest.rarity != "normal") {
						var a = this.chests[this.chests.length-1];
						var healthBar = a.healthBar;
						var chest = a.item;
						var maxHealth = a.maxHealth;
						var health = a.health;

						this.UICam.ignore(healthBar.bar);
						healthBar.x += chest.displayWidth/2;
						healthBar.width = chest.displayWidth/1.2;
						healthBar.x -= healthBar.width/2;
						healthBar.maxValue = maxHealth;
						healthBar.y -= 25+(healthBar.height/2);
						healthBar.setHealth(health);

					}
					
						if(anim) {
							this.tweens.add({
								targets: this.chests[this.chests.length-1].item,
								alpha: 1,
								x: chest.pos.x,
								y: chest.pos.y,
								duration: 250,
								ease: "Sine2"
							});
						}
					this.UICam.ignore(this.chests[this.chests.length - 1].item);
				};

				this.socket.on("coins", (coinsArr) => {
				//	console.log("recieved coins", coinsArr.length);
           
					coinsArr.forEach((coin) => {
						if(this.coins.filter(e => e.id == coin.id).length == 0) {
							addCoin(coin);
						}
					});

					var remove = this.coins.filter(e=>coinsArr.filter(b => (e.id == b.id) && (!e.state.collected)).length == 0);
					remove.forEach((coin) => {
               
						coin.item.destroy();
					});
					this.coins = this.coins.filter(e=>coinsArr.filter(b => (e.id == b.id) && (!e.state.collected)).length == 1);
				});

				this.socket.on("coin", ([coin, start]) => {      
					if(Array.isArray(coin)) {
						if(start) {
						coin.forEach((x) => {
							addCoin(x, start);
						});
					} else {
						coin.forEach((x) => {
							addCoin(x);
						});
					}
					} else {      
						addCoin(coin);
					}
				});


				this.socket.on("chests", (chestsArr) => {
           
					chestsArr.forEach((chest) => {
						if(this.chests.filter(e => e.id == chest.id).length == 0) {
							addChest(chest);
						}
					});

					var remove = this.chests.filter(e=>chestsArr.filter(b => (e.id == b.id)).length == 0);
					remove.forEach((chest) => {
               
						chest.item.destroy();
						if(chest.healthBar) chest.healthBar.bar.destroy();
					});
					this.chests = this.chests.filter(e=>chestsArr.filter(b => (e.id == b.id)).length == 1);
				});

				this.socket.on("chest", (chest, start) => {      
					if(Array.isArray(chest)) {
						if(start) {
						chest.forEach((x) => {
							addChest(x, start);
						});
					} else {
						chest.forEach((x) => {
							addChest(x);
						});
					}
					} else {      
						addChest(chest);
					} 
				});

				this.socket.on("chestHealth", ([id, health, playerId]) => {
					var chest = this.chests.find(e => e.id == id);
					if(chest) {
						chest.health = health;
						if(chest.healthBar) {
							chest.healthBar.setHealth(chest.health);
							if(playerId == this.socket.id && chest.health > 0) {
								this.chestHit.play();
							}
						}
					}
				});
				//this.time.delayedCall(3000, () => {
				this.socket.on("youDied", (data) => {
					//this.died(data);

					// var data = {
					// 	killedBy: "me",
					// 	timeSurvived: 100000
					// }
          this.dtas = {
            killedBy: data.killedBy,
            timeSurvived: data.timeSurvived
          };
					this.spectating = true;
					
					this.mePlayer.destroy();
					this.meBar.destroy();
					this.meSword.destroy();
					this.lvlBar.destroy();
					this.lvlState.destroy();
					this.killCount.destroy();
					this.leaderboard.destroy();
					this.miniGraphics.destroy();
					this.playerCount.destroy();
					if(this.ability) this.ability.setVisible(false);
					if(this.abilityButton) this.abilityButton.setVisible(false);
					if(this.classPicker) this.classPicker.clear();
					if(this.chat.obj) this.chat.obj.destroy();
          if(this.mobile) {
						try {
			if( this.options.movementMode == "keys")  this.joyStick.destroy();
						} catch(e) {
							console.log("joystick not found");
						}
			  this.chat.btn.destroy();
				this.throwBtn.destroy();
		  }
					this.miniMap.people.forEach((person) => {
						person.circle.destroy();
					});
					this.miniMap.people = [];
          function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
  
    return (hours == "00"?"": hours+"h ") + (minutes == "00"?"": minutes+"m ") + seconds+"s";
  }

					//wait 1.5 sec
					this.time.delayedCall(1500, () => {
						
						//show death screen
						this.deathRect = this.add.rectangle(this.canvas.width/2, this.canvas.height/2, this.canvas.width/2, this.canvas.height/1.5, 0x90EE90).setAlpha(0);
            this.cameras.main.ignore(this.deathRect);
						this.tweens.add({
							targets: this.deathRect,
							alpha: 1,
							duration: 250,
							ease: "Sine2",
							onComplete: () => {
								window.onbeforeunload = () => {};
										this.deadText = this.add.text(this.canvas.width/2, (this.deathRect.y- (this.deathRect.height/2)), "You got stabbed", {fontFamily: "Arial", fontSize: "32px", color: "#000000"}).setOrigin(0.5);
                this.cameras.main.ignore(this.deadText);
								this.deadText.setFontSize(Math.min(this.canvas.width/25,this.canvas.height/20));
								this.deadText.y += this.deadText.height;
                
																var msgs = ["Nooooooooo", "Rest in peace", "You can do better!", "Practice makes perfect!", "Keep trying!"];
								var msg = msgs[Math.floor(Math.random() * msgs.length)];
								this.dataText = this.add.text(this.canvas.width/2, this.deadText.y, msg, {fontFamily: "Arial", fontSize: "32px", color: "#000000"}).setOrigin(0.5);
								this.dataText.setFontSize(Math.min(this.canvas.width/40, this.canvas.height/30));
					
							this.dataText.y += this.dataText.height*1.5;
                 this.cameras.main.ignore(this.dataText);

							this.statsText = this.add.text(this.canvas.width/2, this.dataText.y, "Stabbed By: "+data.killedBy+"\nCoins: 0\nKills: 0\nSurvived: 0s", {fontFamily: "Arial", fontSize: "32px", color: "#000000"}).setOrigin(0.5);
								this.statsText.setFontSize(Math.min(this.canvas.width/35, this.canvas.height/25));
							this.statsText.y += this.statsText.height;
                this.cameras.main.ignore(this.statsText);


      this.playAgain = new ImgButton(this, 0,0, "playAgainBtn",()=>{
        this.callback();
        this.socket.disconnect();
        
          this.scene.start("title");
      });this.playAgain.btn.setScale(Math.min(this.canvas.width/6533.33333333,this.canvas.height/5532.33333333));
                this.cameras.main.ignore(this.playAgain.btn);

                          this.playAgain.btn.y = this.statsText.y + this.statsText.displayHeight;
              this.playAgain.btn.x = this.canvas.width/2;
              this.playAgain.btn.x -= this.playAgain.btn.displayWidth/2;
               

			this.tweens.addCounter({
				from: 0,
				to: 100,
				duration: 1000,
				onUpdate:  (tween)=>
				{
					
					//  tween.getValue = range between 0 and 360
		
					var coins = Math.round(this.myObj.coins * (tween.getValue()/100));
          var kills = Math.round(this.myObj.kills * (tween.getValue()/100));
          var time = Math.round(data.timeSurvived * (tween.getValue()/100));

          this.statsText.setText("Stabbed By: "+data.killedBy+"\nCoins: "+coins+"\nKills: "+kills+"\nSurvived: "+msToTime(time));
          
				
				}
			});    
						}
						});

					});

					
					

				});
				this.socket.on("youWon", (data) => {
					this.win(data);
				});
				this.socket.on("collected", ([coinId, playerId, coin]) => {
					if(this.myObj && this.myObj.id == playerId) {
						(coin?this.coin:this.chestOpen).play();
					}
					// eslint-disable-next-line semi
					if(this.coins.find(coin => coin.id == coinId)) this.coins.find(coin => coin.id == coinId).state = {collected: true, collectedBy: playerId, time: 0}
					else if(this.chests.find(chest => chest.id == coinId)) { 
						var chest = this.chests.find(chest => chest.id == coinId);

						if(this.sys.game.loop.actualFps < 30) {
							chest.item.destroy();
							if(chest.healthBar) {
								chest.healthBar.bar.destroy();
							}
							

						}
						else this.tweens.add({
						targets: chest.healthBar?[chest.item, chest.healthBar.bar]:chest.item,
						alpha: 0,
						duration: 500,
						ease: "Sine2",
						onComplete: (t) => {
							//delete chest
							t.targets[0].destroy();
						}
					});
					}
				});

				this.playerCount.x = this.miniGraphics.x + (this.miniMap.scaleFactor * 2 );
				this.playerCount.y = this.canvas.height - (this.miniMap.scaleFactor * 2 ) - 17;


				setTimeout(() => {
						this.tweens.add({
							targets: [this.mePlayer, this.meSword, this.meBar.bar],
							alpha: 1,
							duration: 100,
							ease: "Linear",
							repeat: 0,
							yoyo: false
						});
				},5000);
			});
			}).catch((e) => {
				console.trace(e);
			});
		});
	}

	update(time, delta) {
		const convert = (num, val, newNum) => (newNum * val) / num;
		if(!this.readyt) return;
try {
        this.lvlBar.update();
} catch(e) {
  console.log("Failed to update level bar");
  console.log(e);
}
       
		var controller = {
			left: false,
			up: false,
			right: false,
			down: false
		};


		var wKey = this.input.keyboard.addKey("W", false);
		var aKey = this.input.keyboard.addKey("A", false);
		var sKey = this.input.keyboard.addKey("S", false);
		var dKey = this.input.keyboard.addKey("D",false);
		var cKey = this.input.keyboard.addKey("C", false);
		
		try {
			this.key = this.mobile && this.joyStick ?  this.joyStick.createCursorKeys() : this.cursors;
			if (this.key.up.isDown || wKey.isDown ) {
				controller.up = true;

			}
			if (this.key.down.isDown || sKey.isDown ) {
				controller.down = true;

			}
			if (this.key.right.isDown || dKey.isDown) {
				controller.right = true;

			}
			if (this.key.left.isDown || aKey.isDown) {
				controller.left = true;

			}
			if (cKey.isDown && this.meSword.visible && !this.chat.toggled) {
				this.socket.send("throw", []);
			}
    
			this.socket.send("move", controller);
		} catch(e) {
			console.log(e);
		}
		// this.lastMove = Date.now()
		//sword 

               
		if(this.meSword) var old = this.meSword.angle;

		if(!this.mobile) var mousePos = this.input;
		else var mousePos = this.gamePoint;

		

		this.meSword.angle = Math.atan2(mousePos.y - ( this.canvas.height / 2), mousePos.x - (this.canvas.width / 2)) * 180 / Math.PI + 45;
		this.mePlayer.angle = this.meSword.angle + 45 +180;


		//sword animation
		/*
		if (this.mouseDown ) {
			if(this.swordAnim.added <= 0) this.swordAnim.go = true;
		}
		else if(this.swordAnim.added >= 50) this.swordAnim.go = false;
        
        
		if(this.swordAnim.go) {


			var cooldown = (this.myObj ? this.myObj.damageCooldown : 120);
			var increase = (50 / cooldown) * delta;
			if(this.swordAnim.added < 50) this.swordAnim.added += increase;
			this.meSword.angle -= this.swordAnim.added;
		} else if(this.swordAnim.added >0) {
			this.swordAnim.added -= 10;
			this.meSword.angle -= this.swordAnim.added;
		}
		*/
		var cooldown = (this.myObj ? this.myObj.damageCooldown : 120);
		if(this.mouseDown && !this.swordAnim.go && this.swordAnim.added == 0) {
			this.swordAnim.go = true;
	

			this.tweens.addCounter({
				from: 0,
				to: 50,
				duration: cooldown/2,
				onUpdate:  (tween)=>
				{
					
					//  tween.getValue = range between 0 and 360
		
					this.swordAnim.added = tween.getValue();
				
				},
				onComplete: ()=>
				{
					//this.swordAnim.added = 0;
					this.swordAnim.go = false;
				}
			});
		} else if(!this.swordAnim.go && !this.mouseDown && this.swordAnim.added > 0) {
			this.swordAnim.go = true;
	

			this.tweens.addCounter({
				from: 50,
				to: 0,
				duration: cooldown/2,
				onUpdate:  (tween)=>
				{
					this.swordAnim.added = tween.getValue();
				},
				onComplete: ()=>
				{
					//this.swordAnim.added = 0;
					this.swordAnim.go = false;
				}
			});
		}
        this.meSword.angle -= this.swordAnim.added;
        
		var mousePos2 = {
			viewport: {
				width: this.canvas.width,
				height: this.canvas.height
			},
			x: mousePos.x,
			y: mousePos.y
		};

		if (this.socket && old && this.meSword.angle != old) this.socket.send("mousePos", mousePos2);

		var fps = this.sys.game.loop.actualFps;
   
		//var difference = function (a, b) { return Math.abs(a - b); }
		function lerp (start, end, amt){
			return (1-amt)*start+amt*end;
		}
		const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
		function repeat(t, m) {
			return clamp(t - Math.floor(t / m) * m, 0, m);
		}

		function lerpTheta(a, b, t) {
			const dt = repeat(b - a, 360);
			return lerp(a, a + (dt > 180 ? dt - 360 : dt), t);
		}
		this.enemies.forEach(enemy => {
			if(Date.now() - enemy.lastTick > 10000) return this.removePlayer(enemy);
		
			if(enemy.playerObj) var scale = enemy.playerObj.scale;
			else var scale = 0.25;
			enemy.bar.width = (enemy.player.height*scale / 0.9375);
			enemy.bar.height = (enemy.player.height*scale*0.150);
			enemy.bar.x = enemy.player.x  - enemy.bar.width / 2;
			enemy.bar.y = enemy.player.y - (enemy.player.height*scale/1.2);
		

			enemy.bar.draw();
			try {
				enemy.nameTag.setFontSize(100*scale);
				enemy.nameTag.x = enemy.player.x  - enemy.nameTag.width / 2;
				enemy.nameTag.y = enemy.player.y - (enemy.player.height*scale) - enemy.nameTag.height;
			} catch(e) {
				console.log(e);
			}
			try {
			if(enemy.playerObj) enemy.chatText.setFontSize(100*enemy.playerObj.scale);
			enemy.chatText.x = enemy.player.x;
			enemy.chatText.y = enemy.nameTag.y - enemy.bar.height;
			} catch(e) {
				console.log(e);
			}
			if(enemy.playerObj) {
				var factor = (100/(enemy.playerObj.scale*100))*1.5;
			} else {
				var factor = 6;
			}         enemy.sword.angle = lerpTheta(enemy.sword.angle, enemy.toAngle, 0.5);
			enemy.player.angle = enemy.sword.angle + 45 + 180;

			
		

			if (enemy.down) {
				if(!enemy.swordAnim.added) enemy.swordAnim.added = 0;
				if(enemy.swordAnim.added <= 0)enemy.swordAnim.go = true;
			} else if(enemy.swordAnim.added >= 50) enemy.swordAnim.go = false;

			if(enemy.swordAnim.go && enemy.swordAnim.added < 50) {
				var increase = ((50 / enemy.playerObj.damageCooldown) * delta)*2;
				if(enemy.swordAnim.added < 50) enemy.swordAnim.added += increase;
			}

			if(!enemy.swordAnim.go  && enemy.swordAnim.added > 0) {
				enemy.swordAnim.added -= 10;

			}
			enemy.sword.angle -= enemy.swordAnim.added;
               

			enemy.sword.x = enemy.player.x + enemy.player.width / factor * Math.cos(enemy.sword.angle * Math.PI / 180);
			enemy.sword.y = enemy.player.y + enemy.player.width / factor * Math.sin(enemy.sword.angle * Math.PI / 180);


                
		});
 

	
		var myObj = this.myObj;
  
		if(!myObj) myObj = {scale: 0.25};
		try {
		this.meBar.width = (this.mePlayer.height*myObj.scale / 0.9375);
		this.meBar.height = (this.mePlayer.height*myObj.scale*0.200);
		this.meBar.x = this.mePlayer.x  - this.meBar.width / 2;
		this.meBar.y = this.mePlayer.y - (this.mePlayer.height*myObj.scale/1.2);
		if(this.myObj) this.meChat.setFontSize(100*this.myObj.scale);
		this.meChat.x = this.mePlayer.x;
		this.meChat.y = this.meBar.y - this.meBar.height;
		this.meBar.draw();
		if(this.myObj) { 
			var factor1 = (100/(this.myObj.scale*100))*1.5;
		} else {
			var factor1 = 6;
		}
		this.meSword.x = this.mePlayer.x + this.mePlayer.width / factor1 * Math.cos(this.meSword.angle * Math.PI / 180);
		this.meSword.y = this.mePlayer.y + this.mePlayer.width / factor1 * Math.sin(this.meSword.angle * Math.PI / 180);
	} catch(e) {
		console.log(e);
	}

        function conv(num) {
			return num>999?parseFloat((num/1000).toFixed(num<10000?2:1))+"k":num;
		}

		//leaderboard
		if(!this.myObj) return;
        
		// var enemies = this.enemies.filter(a=>a.hasOwnProperty("playerObj") && a.playerObj);
		var enemies = this.all.players.map((p) => {return {playerObj: p};});

		enemies.push({playerObj: this.myObj});
		try {
			var sorted = enemies.sort((a,b) => a.playerObj.coins - b.playerObj.coins).reverse();
			var text = "";
			var amIinit = false;
			var limit = this.mobile || this.canvas.height < 550 ? 5 : 10;
			sorted.slice(0,limit).forEach((entry, i) => {
				if(!entry.playerObj) return;
				if(!entry.playerObj.hasOwnProperty("coins")) return console.log(entry.playerObj);
				if(entry.playerObj.id == this.myObj.id) amIinit = true;
				var playerObj = entry.playerObj;

					var rankingColors = [
						{color: "#90EE90", ranking: 100},
						{color: "#023020", ranking: 50},
	
						{color: "#ffa500", ranking: 10},
	
						{color: "#ffff00", ranking: 5},
	
						{color: "#ff0000", ranking: 1},
	
					];
				var rankingColor;
				if(playerObj.ranking) {
					rankingColors.forEach(d => {
						if(playerObj.ranking <= d.ranking) {

							rankingColor = d.color;
							
						}
					});
				}

				text += `#${i+1}: ${playerObj.verified? playerObj.name.toLowerCase()=="mitblade" ||playerObj.name.toLowerCase()=="codergautam"||playerObj.name.toLowerCase()=="cosmicwarlord" ?"[color=#FF0000]":"[color=#0000FF]":""}${playerObj.name}${playerObj.verified? "[/color]":""}${rankingColor ? `[color=${rankingColor}](#${playerObj.ranking})[/color]` : ""}- ${conv(playerObj.coins)}\n`;

			});
			if(!amIinit) {
				var playerObj = this.myObj;
				var rankingColors = [
					{color: "#90EE90", ranking: 100},
					{color: "#023020", ranking: 50},

					{color: "#ffff00", ranking: 10},

					{color: "#ffa500", ranking: 5},

					{color: "#ff0000", ranking: 1},

				];
				var rankingColor;
				if(playerObj.ranking) {
					rankingColors.forEach(d => {
						if(playerObj.ranking <= d.ranking) {

							rankingColor = d.color;
							
						}
					});
				}
				var myIndex = sorted.findIndex(a=> a.playerObj.id == this.myObj.id);

				text += `...\n#${myIndex+1}: ${playerObj.verified? playerObj.name.toLowerCase()=="mitblade" ||playerObj.name.toLowerCase()=="codergautam"||playerObj.name.toLowerCase()=="cosmicwarlord" ?"[color=#FF0000]":"[color=#0000FF]":""}${playerObj.name}${playerObj.verified? "[/color]":""}${rankingColor ? `[color=${rankingColor}](#${playerObj.ranking})[/color]` : ""}- ${conv(playerObj.coins)}\n`;

			}
			if(!this.spectating) {
			this.leaderboard.setText(text);
			
			this.leaderboard.x = this.canvas.width - this.leaderboard.width - 15;
			this.throwBtn.btn.setScale(this.chat.btn.btn.scale/2);
			this.throwBtn.btn.y = this.miniGraphics.y+10	;
			this.throwBtn.btn.x = this.miniGraphics.x - this.throwBtn.btn.displayWidth-10;

			}
		} catch(e) {
			//we shall try next frame
			console.log(e);
		}
		//playercount
		
		try {
			// add one because count myself
			if(!this.spectating)	this.playerCount.setText("Players: " + (this.all.players.length+1).toString() + (this.canvas.height<550 ? "" : "\nFPS: " + Math.round(this.sys.game.loop.actualFps)+"\nTPS: "+this.tps+"\nPing: "+this.ping+" ms"));
		} catch(e) {
			console.log(e);
		}

		if(!this.myObj) return;
		const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1); 
		this.coins.forEach((coin) => {
			if(coin.state.collected) {
				if(coin.state.collectedBy == this.myObj.id) {
					var x = this.mePlayer.x;
					var y = this.mePlayer.y;
				} else {
					try {
						var player = this.enemies.find(el => el.id == coin.state.collectedBy);
                        if(player) {
						var x = player.player.x;
						var y = player.player.y;
                        } else {
                            coin.item.destroy();
                            this.coins = this.coins.filter((el) => el.id != coin.id);
                            return;
			}
					} catch(e) {
						console.log(e);
						return;
					}
				}
				coin.item.x = lerp(coin.item.x, x, ((6 - (Math.log2(fps) - Math.log2(1.875))) / 10)*2);
				coin.item.y = lerp(coin.item.y, y,(6 - (Math.log2(fps) - Math.log2(1.875))) / 10);
				coin.state.time += 1;
				if(distance(coin.item.x, coin.item.y, x, y) < this.mePlayer.width * this.mePlayer.scale / 3 || coin.state.time > 7) {
					coin.item.destroy();
					this.coins = this.coins.filter((el) => el.id != coin.id);
				}
                
			}
		});

		//background movement
		var player = this.mePlayer;
		this.background.setTilePosition(
			((this.cameras.main.scrollX*this.cameras.main.zoom)+(player.x -  (this.cameras.main.scrollX*this.cameras.main.zoom)- (this.canvas.width/2)))
			, ((this.cameras.main.scrollY*this.cameras.main.zoom)+(player.y -  (this.cameras.main.scrollY*this.cameras.main.zoom) - (this.canvas.height/2)))
		);
		this.background.x = player.x - (this.cameras.main.displayWidth / 2);
		this.background.y = player.y - (this.cameras.main.displayHeight/ 2);

		if (this.ready && !this.dead && !this.socket.connected) {
			document.write("<h1>You got disconnected</h1><br><button onclick=\"location.reload()\"><h1>Refresh</h1></button>");
			this.dead = true;
		}
	}
}

export default GameScene;
