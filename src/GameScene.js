import HealthBar from "./HealthBar.js";

class GameScene extends Phaser.Scene {
	constructor(callback) {
		super();
		this.callback = callback;
	
	}

	preload() {    
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
		this.loadtext= this.add.text(this.canvas.width/2, this.canvas.height/2, "Loading...", {fontFamily: "Arial", fontSize: "32px", color: "#ffffff"}).setOrigin(0.5).setScrollFactor(0, 0).setDepth(200);
		this.ping = 0;
	}

	died(data) {
		this.loseSound.play();
		this.children.list.forEach((b) => {
			b.destroy();
		});
		this.dead = true;
		data = Object.assign(data, {name: this.myObj.name, kills: this.myObj.kills, coins: this.myObj.coins});
		this.callback({win:false, data: data});
	}
	win(data) {
		this.winSound.play();
		this.dead = true;  
		data = Object.assign(data, {name: this.myObj.name, kills: this.myObj.kills, coins: this.levels[this.levels.length-1].coins});
		this.callback({win: true, data:data});
	}

	create() {
		var map = 10000;

        this.levels = [];
  
		//recaptcha

		grecaptcha.ready(() =>{
			grecaptcha.execute("6LdVxgYdAAAAAPtvjrXLAzSd2ANyzIkiSqk_yFpt", {action: "join"}).then((thetoken) => {

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
    

				this.coin = this.sound.add("coin", config);
				this.chestOpen = this.sound.add("chestOpen", config);
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
				this.swordAnim = {go: false, added: 0};
				this.goTo = {
					x: undefined,
					y: undefined
				};
				this.myObj = undefined;

				//killcounter
				try { 
				this.killCount = this.add.rexBBCodeText(15, 10, "Kills: 0", {
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
        
				this.cameras.main.ignore(this.miniGraphics);

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
				}
      
				//bar
				this.meBar = new HealthBar(this, 0, 0, 16, 80);
				this.meBar.bar.setAlpha(0.5);

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

				//coins array
				this.coins = [];
				this.chests = [];
				// this.lastMove = Date.now()

				//enemies array
				this.enemies = [];
				this.dead = false;
				//arrow keys
				var KeyCodes = Phaser.Input.Keyboard.KeyCodes;
				this.cursors = this.input.keyboard.addKeys({
					up: KeyCodes.UP,
					down: KeyCodes.DOWN,
					left: KeyCodes.LEFT,
					right: KeyCodes.RIGHT,
				}, false);

				//lvl text
				this.lvlText = this.add.text(this.canvas.width / 2, this.canvas.height / 5,  "", { fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif" }).setFontSize(convert(1366, 75, this.canvas.width)).setDepth(75).setAlpha(0).setOrigin(0.5);
				this.lvlTextTween = undefined;

				this.lvlState = this.add.text(this.canvas.width / 2, this.lvlBar.y - (this.lvlBar.height),  "", { fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif" }).setFontSize(convert(1366, 50, this.canvas.width)).setDepth(75).setAlpha(1).setOrigin(0.5);
				this.lvlState.y = this.lvlBar.y - (this.lvlState.height / 2);

				//camera follow
				this.cameras.main.setZoom(1);
        
        
				this.UICam = this.cameras.add(this.cameras.main.x, this.cameras.main.y, this.canvas.width, this.canvas.height);
				this.cameras.main.ignore([ this.killCount, this.playerCount, this.leaderboard,this.lvlBar.bar, this.lvlText, this.lvlState ]);
				this.UICam.ignore([this.mePlayer, this.meBar.bar, this.meSword, this.background]);
				this.cameras.main.startFollow(this.mePlayer,true);


				this.input.addPointer(3);
				///resize dynamicly
				const resize = () => {
					if(!this.scene.isActive("game")) return;
					try {

						this.game.scale.resize( this.canvas.width,  this.canvas.height);
						this.lvlText.y = this.canvas.height / 5;
						this.lvlText.x = this.canvas.width  /2;
						if(this.mobile && this.options.movementMode =="keys") {

							this.joyStick.x = this.canvas.width / 8;
							this.joyStick.y = this.canvas.height - this.canvas.height / 2.5;
							this.joyStick.base.radius = convert(2360, 250, this.canvas.width);
							this.joyStick.thumb.radius = convert(2360, 100, this.canvas.width);
							this.joyStick.radius = convert(2360, 250, this.canvas.width);
						}
						
						this.UICam.x = this.cameras.main.x;
						this.UICam.y = this.cameras.main.y;

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

				window.addEventListener("resize", resize, true);
				//go packet
				var server = this.scene.get("open").server == "us" ? "https://swordbattle.codergautamyt.repl.co" : "https://swordbattle.herokuapp.com";
				this.socket = io(server);
				
				function handleErr(err) {
					document.write("Failed to connect to the server, please try a different server or contact devs.<br>" + err+"<br><br>");
				}
				this.socket.on("connect_error", handleErr);
				this.socket.on("connect_failed",handleErr);

				if(!this.secret) this.socket.emit("go", this.name, thetoken, false, this.options);
				else this.socket.emit("go", this.secret, thetoken, true,this.options);
				//mouse down

				this.input.on("pointerdown", function (pointer) {
					if(this.mobile && this.joyStick &&this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return;
					if (!this.mouseDown) {
						this.gamePoint = {x: pointer.x, y: pointer.y};
						this.mouseDown = true;
						this.socket.emit("mouseDown", true);

					}
				}, this);
				this.input.on("pointerup", function (pointer) {
            
					if(this.mobile && this.joyStick && this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return;
					if (this.mouseDown) {
						this.gamePoint = {x: pointer.x, y: pointer.y};
						this.mouseDown = false;
						this.socket.emit("mouseDown", false);
					}
				}, this);
				if(this.mobile) {
					this.gamePoint = {x: 0, y: 0};
					this.input.on("pointermove", (pointer) => {
						if(this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return;
						this.gamePoint = {x: pointer.x, y: pointer.y};
					});
				}
				this.socket.on("tps", (tps) => {
					this.tps = tps;
					var start = Date.now();
					this.socket.emit( "ping",()=> {
							this.ping = (Date.now() - start);
					});

				});
				this.socket.on("ban", (data) => {
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

				const addPlayer = (player) => {
					if (this.enemies.filter(e => e.id === player.id).length > 0) return;
					/* vendors contains the element we're looking for */

					var enemy = {
						id: player.id,
						down: false,
						toMove: {
							x: undefined,
							y: undefined
						},
						playerObj: undefined,
						lastTick: Date.now(),
						sword: this.add.image(player.pos.x, player.pos.y, player.skin+"Sword").setScale(0.25).setDepth(49),
						player: this.add.image(player.pos.x, player.pos.y, player.skin+"Player").setScale(0.25).setDepth(49),
						bar: new HealthBar(this, player.pos.x, player.pos.y + 55),
						nameTag: this.add.rexBBCodeText(player.pos.x, player.pos.y - 90, `${player.name}`, {
							fontFamily: "serif",
							fill: player.verified?"#0000FF" :"#000000",
							fontSize: "25px"
						}).setDepth(100).setAlpha(player.verified?1:0.5),
						swordAnim: {go: false, added: 0},
						toAngle: 0,
					};
         
					var factor = (100/(player.scale*100))*1.5;
       
					enemy.sword.angle = Math.atan2(player.mousePos.y - ((player.mousePos.viewport.height) / 2), player.mousePos.x - ((player.mousePos.viewport.width) / 2)) * 180 / Math.PI + 45;
            
            
					enemy.sword.x = enemy.player.x + enemy.player.width / factor * Math.cos(enemy.sword.angle * Math.PI / 180);
					enemy.sword.y = enemy.player.y + enemy.player.width / factor * Math.sin(enemy.sword.angle * Math.PI / 180);

          
					this.UICam.ignore([enemy.player, enemy.bar.bar, enemy.sword, enemy.nameTag, this.graphics]);
					this.enemies.push(enemy);

					var circle = this.add.circle(0, 0, 10, 0xFF0000);
					this.cameras.main.ignore(circle);
					circle.setDepth(98);
					this.miniMap.people.push(
						{
							id: player.id,
							circle: circle
						}
					);

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
				this.removePlayer = (id) => {
					try {
						var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == id);
        


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
								var miniMapPlayer = this.miniMap.people.find(x => x.id === id);
								miniMapPlayer.circle.destroy();
								this.miniMap.people = this.miniMap.people.filter(p => p.id != id);
							}
						});
								
        
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
				this.socket.on("me", (player) => {
					if(this.loadrect.visible) this.loadrect.destroy();
					if(this.loadtext.visible) this.loadtext.destroy();
					if(this.levels.length > 0) {

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
					if(this.mePlayer.texture.key+"Player" != player.skin) {
						this.mePlayer.setTexture(player.skin+"Player");
						this.meSword.setTexture(player.skin+"Sword");
					}

					if (!this.myObj) {
						this.mePlayer.x = player.pos.x;
						this.mePlayer.y = player.pos.y;
					} else {
						this.goTo.x = player.pos.x;
						this.goTo.y = player.pos.y;
					}
					this.mePlayer.setScale(player.scale);
					this.meBar.maxValue = player.maxHealth;
					this.meBar.setHealth(player.health);
					// if(this.myObj) console.log( this.cameras.main.zoom+" -> "+this.myObj.coins+" -> "+player.scale)
					if(!(this.cameras.main.zoom <= 0.15)) {
						 
						if(player.scale < 0.75) this.cameras.main.setZoom(1.25-player.scale);
						if(player.scale >= 3) this.cameras.main.setZoom(0.56-((player.scale-1)/8));
						else if(player.scale >= 1) this.cameras.main.setZoom(0.56-((player.scale-1)/8));
            
						else if(player.scale >= 0.75) this.cameras.main.setZoom(0.56-((player.scale-0.75)/3));



					}
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

					var miniMapPlayer = this.miniMap.people.find(x => x.id === player.id);
            
					miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / (map/2)) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor;
					miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / (map/2)) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor;
					miniMapPlayer.circle.radius = player.scale * convert(1280, 15, this.canvas.width);

				});
				this.socket.on("player", (player) => {
					//update player
					if (!this.ready) return;
					try {
               
						var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == player.id);
						if(!enemy) return;

						enemy.lastTick = Date.now();

						enemy.playerObj = player;
						enemy.bar.maxValue = player.maxHealth;
						enemy.bar.setHealth(player.health);

						//update pos
						enemy.toMove.x = player.pos.x;
						enemy.toMove.y = player.pos.y;

						//update sword
						var mousePos = player.mousePos;
						enemy.toAngle = Math.atan2(mousePos.y - ((mousePos.viewport.height) / 2), mousePos.x - ((mousePos.viewport.width) / 2)) * 180 / Math.PI + 45;

						enemy.player.setScale(player.scale);
						enemy.sword.setScale(player.scale);
						enemy.down = player.mouseDown;

						//minimap
						var miniMapPlayer = this.miniMap.people.find(x => x.id === player.id);
            
        

						miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / (map/2)) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor;
						miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / (map/2)) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor;
						miniMapPlayer.circle.radius = convert(1280, 15, this.canvas.width) * player.scale;

					} catch (e) {
						console.log(e);
					}
				});
				this.socket.on("playerLeave", this.removePlayer);
				this.socket.on("playerDied", (id, data) => {
				//check if killed by me

				if(this.myObj && this.myObj.id === data.killedBy.id) {
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
					var txt = `[b][color=#e82a1f]Killed [/color][color=#0000FF]${enemy.playerObj.name}[/color][/b]`;
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

				this.socket.on("dealHit", (playerId, pPos) => {
					var player = this.enemies.find(enemyPlayer => enemyPlayer.id == playerId);
					if(player) {
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
				this.socket.on("takeHit", (playerId, pPos) => {
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
							item: this.add.image(start[0], start[1], "chest").setScale(chest.scale).setDepth(21).setAlpha(anim?0:1).setOrigin(0),
						}
					);
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

				this.socket.on("coin", (coin, start) => {      
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

				this.socket.on("youDied", (data) => {
					this.died(data);
				});
				this.socket.on("youWon", (data) => {
					this.win(data);
				});
				this.socket.on("collected", (coinId, playerId, coin) => {
					if(this.myObj && this.myObj.id == playerId) {
						(coin?this.coin:this.chestOpen).play();
					}
					// eslint-disable-next-line semi
					if(this.coins.find(coin => coin.id == coinId)) this.coins.find(coin => coin.id == coinId).state = {collected: true, collectedBy: playerId, time: 0}
					else if(this.chests.find(chest => chest.id == coinId)) this.tweens.add({
						targets: this.chests.find(chest => chest.id == coinId).item,
						alpha: 0,
						duration: 500,
						ease: "Sine2",
						onComplete: (t) => {
							//delete chest
							t.targets[0].destroy();
						}
					});
				
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
    
			this.socket.emit("move", controller);
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
        
        
		var mousePos2 = {
			viewport: {
				width: this.canvas.width,
				height: this.canvas.height
			},
			x: mousePos.x,
			y: mousePos.y
		};

		if (this.socket && old && this.meSword.angle != old) this.socket.emit("mousePos", mousePos2);

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
			// if (enemy.player.x != enemy.toMove.x && enemy.player.y !=enemy.toMove.y) speed = speed *0.707
			/*        no lerp
            if (enemy.player.x < enemy.toMove.x) enemy.player.x += speed
            if (enemy.player.x > enemy.toMove.x) enemy.player.x -= speed
            if (enemy.player.y < enemy.toMove.y) enemy.player.y += speed
            if (enemy.player.y > enemy.toMove.y) enemy.player.y -= speed
            */
			//yes lerp

			if(enemy.toMove.x ) {
				enemy.player.x = lerp(enemy.player.x, enemy.toMove.x,fps/500);
				enemy.player.y = lerp(enemy.player.y, enemy.toMove.y, fps/500);
			}


			// if(difference(enemy.player.x, enemy.toMove.x) < speed) enemy.player.x = enemy.toMove.x
			// if(difference(enemy.player.y, enemy.toMove.y) < speed) enemy.player.y = enemy.toMove.y
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
				var increase = (50 / enemy.playerObj.damageCooldown) * delta;
				if(enemy.swordAnim.added < 50) enemy.swordAnim.added += increase;
			}

			if(!enemy.swordAnim.go  && enemy.swordAnim.added > 0) {
				enemy.swordAnim.added -= 10;

			}
			enemy.sword.angle -= enemy.swordAnim.added;
               

			enemy.sword.x = enemy.player.x + enemy.player.width / factor * Math.cos(enemy.sword.angle * Math.PI / 180);
			enemy.sword.y = enemy.player.y + enemy.player.width / factor * Math.sin(enemy.sword.angle * Math.PI / 180);


                
		});
 
		/*    if(this.myObj) {
            var speed = this.myObj.speed / fps
        } else {
            var speed = 700 /fps
        }
        
   
         //console.log(speed)
     
        if (this.goTo.x != this.mePlayer.x && this.goTo.y != this.mePlayer.y) speed = speed *0.707
 //without lerp
        if (this.goTo.x < this.mePlayer.x) this.mePlayer.x -= speed
        if (this.goTo.x > this.mePlayer.x) this.mePlayer.x += speed
        if (this.goTo.y < this.mePlayer.y) this.mePlayer.y -= speed
        if (this.goTo.y > this.mePlayer.y) this.mePlayer.y += speed
        */
		//with lerp

		if(this.goTo.x ) {
    
			this.mePlayer.x = lerp(this.mePlayer.x, this.goTo.x, fps/500);
			this.mePlayer.y = lerp(this.mePlayer.y, this.goTo.y,fps/500);
		}
		//console.log(this.mePlayer.x, this.mePlayer.y)
		//  if(difference(this.goTo.x, this.mePlayer.x) < 10) this.mePlayer.x = this.goTo.x
		//  if(difference(this.goTo.y, this.mePlayer.y) < 10) this.mePlayer.y = this.goTo.y
		var myObj = this.myObj;
  
		if(!myObj) myObj = {scale: 0.25};

		this.meBar.width = (this.mePlayer.height*myObj.scale / 0.9375);
		this.meBar.height = (this.mePlayer.height*myObj.scale*0.200);
		this.meBar.x = this.mePlayer.x  - this.meBar.width / 2;
		this.meBar.y = this.mePlayer.y - (this.mePlayer.height*myObj.scale/1.2);
		this.meBar.draw();
		if(this.myObj) { 
			var factor1 = (100/(this.myObj.scale*100))*1.5;
		} else {
			var factor1 = 6;
		}
		this.meSword.x = this.mePlayer.x + this.mePlayer.width / factor1 * Math.cos(this.meSword.angle * Math.PI / 180);
		this.meSword.y = this.mePlayer.y + this.mePlayer.width / factor1 * Math.sin(this.meSword.angle * Math.PI / 180);


        function conv(num) {
			return num>999?parseFloat((num/1000).toFixed(num<10000?2:1))+"k":num;
		}

		//leaderboard
		if(!this.myObj) return;
        
		var enemies = this.enemies.filter(a=>a.hasOwnProperty("playerObj") && a.playerObj);

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
				text += `#${i+1}: ${playerObj.verified? "[color=#0000FF]":""}${playerObj.name}${playerObj.verified? "[/color]":""}- ${conv(playerObj.coins)}\n`;
			});
			if(!amIinit) {
				var myIndex = sorted.findIndex(a=> a.playerObj.id == this.myObj.id);
				text += `...\n#${myIndex+1}: ${this.myObj.verified? "[color=#0000FF]":""}${this.myObj.name}${this.myObj.verified? "[/color]":""}- ${conv(this.myObj.coins)}\n`;
			}

			this.leaderboard.setText(text);
			this.leaderboard.x = this.canvas.width - this.leaderboard.width - 15;

		} catch(e) {
			//we shall try next frame
			console.log(e);
		}
		//playercount
		
		try {
			this.playerCount.setText("Players: " + (Object.keys(this.enemies).length + 1).toString() + (this.mobile ? "" : "\nFPS: " + Math.round(this.sys.game.loop.actualFps)+"\nTPS: "+this.tps+"\nPing: "+this.ping+" ms"));
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
		this.background.setTilePosition(
			((this.cameras.main.scrollX*this.cameras.main.zoom)+(this.mePlayer.x -  (this.cameras.main.scrollX*this.cameras.main.zoom)- (this.canvas.width/2)))
			, ((this.cameras.main.scrollY*this.cameras.main.zoom)+(this.mePlayer.y -  (this.cameras.main.scrollY*this.cameras.main.zoom) - (this.canvas.height/2)))
		);
		this.background.x = this.mePlayer.x - (this.cameras.main.displayWidth / 2);
		this.background.y = this.mePlayer.y- (this.cameras.main.displayHeight/ 2);

		if (this.ready && !this.dead && !this.socket.connected) {
			document.write("<h1>You got disconnected</h1><br><button onclick=\"location.reload()\"><h1>Refresh</h1></button>");
			this.dead = true;
		}
	}
}

export default GameScene;
