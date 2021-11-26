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
		this.loadrect = this.add.rectangle(0,0, this.canvas.width*2, this.canvas.height*2, 0x006400).setDepth(200);
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
				this.damage = this.sound.add("damage", config);
				this.hit = this.sound.add("hit", config);
				this.winSound = this.sound.add("winSound", config);
				this.loseSound = this.sound.add("loseSound", config);
    
				this.tps = 0;
				//background
				this.background = this.add.tileSprite(0, 0, this.canvas.width, this.canvas.height, "background").setOrigin(0).setDepth(2);
				this.background.fixedToCamera = true;

				//player 
        
				this.meSword = this.add.image(400, 100, "sword").setScale(0.25).setDepth(50);
				this.mePlayer = this.add.image(400, 100, "player").setScale(0.25).setDepth(51);
				this.swordAnim = {go: false, added: 0};
				this.goTo = {
					x: undefined,
					y: undefined
				};
				this.myObj = undefined;

				//killcounter
				this.killCount = this.add.text(this.canvas.width / 1.5, 0, "Kills: 0", {
					fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif"
				}).setFontSize(40).setDepth(101);
				this.killCount.scrollFactorX = 0;
				this.killCount.scrollFactorY = 0;

				//player+fpscounter
				try { 
					this.playerCount = this.add.text(this.cameras.main.worldView.x*this.cameras.main.zoom, this.cameras.main.worldView.y*this.cameras.main.zoom, "Players: 0" + "\nFPS: 0", {
						fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif"
					}).setFontSize(20).setDepth(101);
					this.playerCount.scrollFactorX = 0;
					this.playerCount.scrollFactorY = 0;

					//leaderboard
					this.leaderboard = this.add.text(this.canvas.width, this.cameras.main.worldView.y*this.cameras.main.zoom, "Players: 0" + "\nFPS: 0", {
						fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif"
					}).setFontSize(20).setDepth(101);
					this.playerCount.scrollFactorX = 0;
					this.playerCount.scrollFactorY = 0;
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
				if(this.mobile) {
					this.joyStick = this.plugins
						.get("rexvirtualjoystickplugin")
						.add(this, {
							x: this.canvas.width / 8,
							y: this.canvas.height - this.canvas.height / 2.5,
							radius: convert(2360, 200, this.canvas.width),
							base: this.add.circle(0, 0, convert(2360, 250, this.canvas.width), 0x888888),
							thumb: this.add.circle(0, 0, convert(2360, 100, this.canvas.width), 0xcccccc)
							// dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
							// forceMin: 16,
							// enable: true
						});
				}
      
				//bar
				this.meBar = new HealthBar(this, 0, 0, 16, 80);

				//levelbar
				this.lvlBar = new HealthBar(this, 0, 0, 0, 0, true);
				var padding = (this.canvas.width / 2);
				this.lvlBar.x = padding / 2;
        
				this.lvlBar.width = this.canvas.width- padding;
				this.lvlBar.height = this.canvas.height / 30;
				this.lvlBar.y = this.canvas.height - this.lvlBar.height - (this.canvas.height / 40);
				this.lvlBar.draw();

				//coins array
				this.coins = [];
				// this.lastMove = Date.now()

				//enemies array
				this.enemies = [];
				this.dead = false;
				//arrow keys
				this.cursors = this.input.keyboard.createCursorKeys();

				//lvl text
				this.lvlText = this.add.text(this.canvas.width / 2, this.canvas.height / 4,  "nice", { fontFamily: "Georgia, \"Goudy Bookletter 1911\", Times, serif" }).setFontSize(75).setDepth(75).setAlpha(0).setOrigin(0.5);
				this.lvlTextTween = undefined;
				
				//camera follow
				this.cameras.main.setZoom(1);
        
        
				this.UICam = this.cameras.add(this.cameras.main.x, this.cameras.main.y, this.canvas.width, this.canvas.height);
				this.cameras.main.ignore([ this.killCount, this.playerCount, this.leaderboard,this.lvlBar.bar, this.lvlText ]);
				this.UICam.ignore([this.mePlayer, this.meBar.bar, this.meSword, this.background]);
				this.cameras.main.startFollow(this.mePlayer);


				this.input.addPointer(3);
				///resize dynamicly
				const resize = () => {
					try {

						this.game.scale.resize( this.canvas.width,  this.canvas.height);
						if(this.mobile) {
							this.joyStick.x = this.canvas.width / 8;
							this.joyStick.y = this.canvas.height - this.canvas.height / 2.5;
							this.joyStick.base.radius = convert(2360, 250, this.canvas.width);
							this.joyStick.thumb.radius = convert(2360, 100, this.canvas.width);
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
            
					} catch(e) {
						console.log(e);
					}
				};

				window.addEventListener("resize", resize, true);
				//go packet
				this.socket = io();
				this.socket.emit("go", this.name, thetoken);

				//mouse down

				this.input.on("pointerdown", function (pointer) {
					if(this.mobile && this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return;
					if (!this.mouseDown) {
						this.gamePoint = {x: pointer.x, y: pointer.y};
						this.mouseDown = true;
						this.socket.emit("mouseDown", true);

					}
				}, this);
				this.input.on("pointerup", function (pointer) {
            
					if(this.mobile && this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return;
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
				});
				this.socket.on("ban", (data) => {
					document.write(data);
				});

				//boundary
				this.graphics = this.add.graphics().setDepth(4);
				var thickness = 5000;
				this.graphics.lineStyle(thickness, 0x006400, 1);

				this.graphics.strokeRoundedRect(-2500 - (thickness/ 2), -2500 - (thickness/ 2), 5000 + thickness, 5000 + thickness, 0 );

				this.graphics.lineStyle(10, 0xffff00, 1);

				this.graphics.strokeRoundedRect(-2500, -2500, 5000, 5000, 0);

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
						nameTag: this.add.text(player.pos.x, player.pos.y - 90, player.name, {
							fontFamily: "serif",
							fill: "#000000",
							fontSize: "25px"
						}).setDepth(100),
						swordAnim: {go: false, added: 0},
						toAngle: 0
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

				};
				this.removePlayer = (id) => {
					try {
						var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == id);
        
						enemy.player.destroy();
						enemy.sword.destroy();
						enemy.bar.destroy();
						enemy.nameTag.destroy();
        
						this.enemies.splice(this.enemies.findIndex(enemy => enemy.id == id), 1);
        
						var miniMapPlayer = this.miniMap.people.find(x => x.id === id);
						miniMapPlayer.circle.destroy();
						this.miniMap.people = this.miniMap.people.filter(p => p.id != id);
        
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
					if(this.levels.length > 0) {

                    var diff = this.levels[player.level-1].coins - this.levels[player.level-1].start;
                    var lvlcoins = player.coins - this.levels[player.level-1].start;
                    this.lvlBar.setLerpValue((lvlcoins / diff)*100);

					if(this.myObj && player.level > this.myObj.level) {

						if(this.lvlTextTween) this.lvlTextTween.stop();

						if(!this.lvlText.data) this.lvlText.setData("x", 0);
						this.lvlText.setData("x", this.lvlText.getData("x")+(player.level-this.myObj.level) );
						this.lvlText.setText("Level up!"+(this.lvlText.getData("x") > 1 ? ` x${this.lvlText.getData("x")}` : ""));

						 var completeCallback = () => {
							this.lvlTextTween = this.tweens.add({
								targets: this.lvlText,
								alpha: 0,
								y: this.canvas.height / 4,
								onComplete: () => this.lvlText.setData("x", 0),
								duration: 300,
								ease: "Power2"
							  }, this);
						};
						this.lvlTextTween = this.tweens.add({
							targets: this.lvlText,
							alpha: 1,
							y: this.canvas.height / 3,
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
					//this.meLine.setTo(0, 0, 250, 250)
					this.killCount.setText("Kills: " + player.kills+"\nCoins: "+player.coins);
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
            
					miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / 2500) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor;
					miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / 2500) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor;
					miniMapPlayer.circle.radius = player.scale * convert(1280, 20, this.canvas.width);

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
            
        

						miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / 2500) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor;
						miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / 2500) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor;
						miniMapPlayer.circle.radius = convert(1280, 20, this.canvas.width) * player.scale;

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
					var s1 = `[color=#e82a1f]Killed [/color][color=#ffffff]${enemy.playerObj.name}[/color]`;
					var text = this.add.rexBBCodeText(100, 30, s1, {
						fontSize: "60px",
					});
					this.cameras.main.ignore(text);
				}
				}

				this.removePlayer(id);

				});

				this.socket.on("dealHit", (playerId) => {
					this.hit.play();
				});
				this.socket.on("takeHit", (playerId) => {
					this.damage.play();
				});

				//coins

				const addCoin = coin => {
					if(this.dead) return;
					this.coins.push(
						{
							id: coin.id,
							item: this.add.image(coin.pos.x, coin.pos.y, "coin").setScale(coin.size/100).setDepth(20),
							state: {collected: false, collectedBy: undefined, time: 0}
						}
					);

					this.UICam.ignore(this.coins[this.coins.length - 1].item);
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

				this.socket.on("coin", (coin) => {      
					if(Array.isArray(coin)) {
						coin.forEach((x) => {
							addCoin(x);
						});
					} else {      
						addCoin(coin);
					}
				});

				this.socket.on("youDied", (data) => {
					this.died(data);
				});
				this.socket.on("youWon", (data) => {
					this.win(data);
				});
				this.socket.on("collected", (coinId, playerId) => {
					if(this.myObj && this.myObj.id == playerId) this.coin.play(); 
					if(this.coins.find(coin => coin.id == coinId)) this.coins.find(coin => coin.id == coinId).state = {collected: true, collectedBy: playerId, time: 0};
				});

			});
		});
	}

	update() {
		if(!this.readyt) return;

        this.lvlBar.update();
       
		var controller = {
			left: false,
			up: false,
			right: false,
			down: false
		};


		var wKey = this.input.keyboard.addKey("W");
		var aKey = this.input.keyboard.addKey("A");
		var sKey = this.input.keyboard.addKey("S");
		var dKey = this.input.keyboard.addKey("D");
		try {
			this.key = this.mobile ?  this.joyStick.createCursorKeys() : this.cursors;
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
		if (this.mouseDown) this.swordAnim.go = true;
		else this.swordAnim.go = false;
        
        
		if(this.swordAnim.go) {

			if(this.swordAnim.added < 50) this.swordAnim.added += 10;
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
				enemy.swordAnim.go = true;
				if(!enemy.swordAnim.added) enemy.swordAnim.added = 0;
			} else enemy.swordAnim.go = false;

			if(enemy.swordAnim.go && enemy.swordAnim.added < 50) {
				enemy.swordAnim.added += 10;
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


        

		//leaderboard
		if(!this.myObj) return;
        
		var enemies = this.enemies.filter(a=>a.hasOwnProperty("playerObj") && a.playerObj);

		enemies.push({playerObj: this.myObj});
		try {
			var sorted = enemies.sort((a,b) => a.playerObj.coins - b.playerObj.coins).reverse().slice(0,(this.mobile ? 5 : 10));
			var text = "";
			sorted.forEach((entry, i) => {
				if(!entry.playerObj) return;
				if(!entry.playerObj.hasOwnProperty("coins")) return console.log(entry.playerObj);
				var playerObj = entry.playerObj;
				text += `#${i+1}: ${playerObj.name}- ${playerObj.coins}\n`;
			});

			this.leaderboard.setText(text);
			this.leaderboard.x = this.canvas.width - this.leaderboard.width;
			this.killCount.x = (this.canvas.width*0.9) - this.leaderboard.width - this.killCount.width;

		} catch(e) {
			//we shall try next frame
			console.log(e);
		}
		//playercount
		try {
			this.playerCount.setText("Players: " + (Object.keys(this.enemies).length + 1).toString() + "\nFPS: " + Math.round(this.sys.game.loop.actualFps));
			this.playerCount.x = 0;
			this.playerCount.y = 0;
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
		this.background.setTilePosition(this.cameras.main.scrollX, this.cameras.main.scrollY);
		this.background.x = this.mePlayer.x - (this.cameras.main.displayWidth / 2);
		this.background.y = this.mePlayer.y- (this.cameras.main.displayHeight/ 2);
		if (this.ready && !this.dead && !this.socket.connected) {
			document.write("<h1>You got disconnected</h1><br><button onclick=\"location.reload()\"><h1>Refresh</h1></button>");
			this.dead = true;
		}
	}
}

export default GameScene;
