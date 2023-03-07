/* eslint-disable max-len */
import Phaser from 'phaser';
import Packet from '../../../../shared/Packet';
import PacketErrorTypes from '../../../../shared/PacketErrorTypes';
import Player, { createPositionBuffer, addPositionBuffer } from '../classes/Player';
// import Coin from '../classes/Coin';
import Ws from '../classes/Ws';
import controller from '../helpers/controller';
import getServerUrl from '../helpers/getServerUrl';
import levels from '../../../../shared/Levels';
import { CPacketWriter } from '../packets/packet';
import Leaderboard from '../classes/Leaderboard';
import constants from '../../../../server/helpers/constants';
import lerpTheta, { lerp } from '../helpers/angleInterp';
import Coin from '../classes/Coin';
import Border from '../classes/Border';
import GameStats from '../classes/GameStats';
import Chest from '../classes/Chest';
import MiniMap from '../classes/MiniMap';
import LevelBar from '../classes/LevelBar';
import PopupMessage from '../classes/PopupMessage';
// eslint-disable-next-line no-unused-vars

export default class MainGame extends Phaser.Scene {
    loadBg: Phaser.GameObjects.Image;
    ws: Ws;
    connectingText: Phaser.GameObjects.Text;
    passedData: { name: string; keys: boolean; volume: number; loggedIn: boolean };
    players: Map<any, Player>;
    coins: Map<number, Coin>;
    grass: Phaser.GameObjects.TileSprite;
    controllerUpdate: () => void;
    debugItems: any[];
    leaderboard: Leaderboard;
    UICamera: Phaser.Cameras.Scene2D.Camera;
    playerNames: Map<number, {name: string; loggedIn: boolean;}> = new Map();
  border: any;
    gameStats: GameStats;
    chests: any;
    miniMap: any;
    levelBar: LevelBar;
    levelUpMessage: null | PopupMessage;
    constructor() {
        super('maingame');
    }
    init(data: any) {
        this.passedData = data;
    }

    preload() {
        // this.debugItems = [];

        this.UICamera = this.cameras.add(0, 0, this.game.canvas.width, this.game.canvas.height).setOrigin(0, 0).setScroll(0, 0);
        this.loadBg = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(0.7);
        this.border = new Border(this, 0, 0, constants.map.width, constants.map.height).setDepth(2);
        this.UICamera.ignore(this.border);

        this.connectingText = this.add
            .text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Connecting...', { fontSize: '64px', color: '#fff', fontFamily: 'Hind Madurai, Arial' })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0, 0)
            .setScale(1);

        this.tweens.add({
            targets: this.connectingText,
            alpha: 0,
            duration: 1000,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
        });
    }

    create() {
        this.ws = new Ws(getServerUrl());

        this.ws.once('connect_error', (reason: string) => {
            this.events.emit('crash', reason);
        });
        this.ws.once('connectionLost', (reason: string) => {
            this.events.emit('crash', reason);
        });

        this.ws.once('connected', () => {
            CPacketWriter.SPAWN(this.ws.streamWriter, this.passedData.name, this.passedData.loggedIn);
            // createJoinPacket(this.ws.streamWriter, this.passedData.name, false);
            this.ws.flushStream();
        });

        this.ws.once(Packet.ServerHeaders.ERROR.toString(), ([code]) => {
            const values = Object.values(PacketErrorTypes);
            const error = values.find((value: any) => value.code === code);
            this.events.emit('crash', error ? (error as any).message : 'An unknown error occured.');
        });

        this.ws.once(Packet.ServerHeaders.CLIENT_SPAWN.toString(), ([id, x, y, rotation, health, skin, name, loggedIn]) => {
            this.ws.id = id;
            this.connectingText.destroy();
            this.loadBg.destroy();
            this.start();

            const player = new Player(this, x, y, name, id, skin, undefined, loggedIn).setDepth(4).setScale(levels[0].scale);
            player.setHealth(health);
            this.players.set(id, player);
            this.UICamera.ignore(player);

            // Camera centered on player
            this.cameras.main.startFollow(player);
        });

        this.ws.on(Packet.ServerHeaders.CREATE_PLAYER.toString(), ([id, x, y, rotation, health, time, level, skin]) => {
            if (this.ws.id === id) return;
            const name = this.playerNames.get(id) as { name: string; loggedIn: boolean};
            const player = new Player(this, x, y, name.name, id, skin, rotation, name.loggedIn).setDepth(3).setScale(levels[level].scale);
            console.log("Created player: " + name.name + " with id: " + id + " and skin: " + skin + " and rotation: " + rotation + " and logged in: " + name.loggedIn + " and level: " + level + " and scale: " + levels[level].scale + " and time: " + time + " and x: " + x + " and y: " + y + " and health: " + health + " and rotation: " + rotation + " and time: " + time + " and level: " + level + " and skin: " + skin + " and name: " + name.name + " and logged in: " + name.loggedIn + " and level: " + level + " and scale: " + levels[level].scale + " and time: " + time + " and x: " + x + " and y: " + y + " and health: " + health + " and rotation: " + rotation + " and time: " + time + " and level: " + level + " and skin: " + skin + " and name: " + name.name + " and logged in: " + name.loggedIn + " and level: " + level + " and scale: " + levels[level].scale + " and time: " + time + " and x: " + x + " and y: " + y + " and health: " + health + " and rotation: " + rotation + " and time: " + time + " and level: " + level + " and skin: " + skin + " and name: " + name.name + " and logged in: " + name.loggedIn + " and level: " + level + " and scale: " + levels[level].scale + " and time: " + time + " and x: " + x + " and y: " + y + " and health: " + health + " and rotation: " + rotation + " and time: " + time + " and level: " + level + " and skin: " + skin + " and name: " + name.name + " and logged in: " + name.loggedIn + " and level: " + level + " and scale: " + levels[level].scale + " and time: " + time + " and x: " + x + " and y: " + y + " and health: " + health + " and")
            player.possitionBuffer.push(createPositionBuffer(time, x, y, rotation));
            player.setHealth(health);
            this.players.set(id, player);
            this.UICamera.ignore(player);
        });

        this.ws.on(Packet.ServerHeaders.PLAYER_LEVEL.toString(), ({id, level}) => {
            const player = this.players.get(id);
            if (!player) return;
            let diff = level - player.level;
            player.setLevel(level);
            if(player.id == this.ws.id) {
                this.updateGrass();
                if(!this.levelUpMessage || !this.levelUpMessage.visible) {
                    this.levelUpMessage = new PopupMessage(this, `Level Up! ${diff > 1 ? `${diff}x` : ""}`, 1280/2, 720/5).setDepth(99);
                    this.levelUpMessage.text.setOrigin(0.5, 0.5);
                    this.levelUpMessage.text.setFontSize(60);
                    this.cameras.main.ignore(this.levelUpMessage);
                }
                 else {
                    let txt = this.levelUpMessage.text.text;
                    let actDiff = 0;
                    console.log(txt.replace(/[^0-9]/g, ''));
                    if(txt.replace(/[^0-9]/g, '').length == 0) actDiff = 1;
                    else actDiff = parseInt(txt.replace(/[^0-9]/g, ''));

                    this.levelUpMessage.text.setText(`Level Up! ${diff + actDiff}x`);
                    this.levelUpMessage.restartTween();


                }
            }
        });

        // TODO: Test this on refresh scene
        this.ws.on(Packet.ServerHeaders.UPDATE_PLAYER.toString(), d => {
            const { id, pos, rotation, time } = d;
            const player = this.players.get(id);
            if (!player) return;
            player.possitionBuffer.push(createPositionBuffer(time, pos.x, pos.y, rotation));

            // player.oldPos.x = player.newPos.x;
            // player.oldPos.y = player.newPos.y;
            // player.newPos.x = pos.x;
            // player.newPos.y = pos.y;
            // player.timestamp1 = player.timestamp2;
            // player.timestamp2 = Date.now();
            // player.oldAngle = player.newAngle;
            // player.newAngle = rotation;
            if (this.myPlayer !== player)
                player.setDirection(rotation);
        });

        this.ws.on(Packet.ServerHeaders.PLAYER_HEALTH.toString(), d => {
            const { id, health } = d;
            const player = this.players.get(id);
            if (!player) return;
            player.setHealth(health);
        });

        this.ws.on(Packet.ServerHeaders.PLAYER_SWING.toString(), d => {
            const { id, s } = d;
            const player = this.players.get(id);
            if (!player) return;
            if (this.myPlayer !== player) {
                player.setMouseDown(s);
            }
        });

        // player joined the server
        this.ws.on(Packet.ServerHeaders.ADD_PLAYER.toString(), d => {
            const { id, name, loggedIn /*, x, y, scale, angle, health*/ } = d;
            console.log("Got playername from server: " + name + " " + loggedIn + " " + id + "")
            this.playerNames.set(id, {name, loggedIn});
        });

        this.ws.on(Packet.ServerHeaders.REMOVE_PLAYER.toString(), d => {
            const { id } = d;
            const player = this.players.get(id);
            if (!player) return;
            player.destroy();
            this.players.delete(id);
        });

        this.ws.on(Packet.ServerHeaders.CREATE_COIN.toString(), ({ id, x, y, value }) => {
            const coin = new Coin(this, id, x, y, value);
            coin.setDepth(2);
            this.coins.set(id, coin);
            this.UICamera.ignore(coin);
        })

        this.ws.on(Packet.ServerHeaders.REMOVE_COIN.toString(), ({ id, collector }) => {
            if (collector && collector !== 0 && this.players.has(collector) && this.coins.has(id)) {
                // Glide coin to player
                const coin = this.coins.get(id) as Coin;
                const player = this.players.get(collector) as Player;

                let startPos = { x: coin.x, y: coin.y };

                this.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: 200,
                    ease: 'Power2',
                    onUpdate: (tween) => {
                        const value = tween.getValue();
                        coin.x = Phaser.Math.Linear(startPos.x, player.x, value);
                        coin.y = Phaser.Math.Linear(startPos.y, player.y, value);
                        coin.setAlpha(1 - value);
                    },
                    onComplete: () => {
                        this.coins.get(id)?.destroy();
                        this.coins.delete(id);
                    }
                });
            } else {
            this.coins.get(id)?.destroy();
            this.coins.delete(id);
            }
        })
        // this.ws.on(Packet.Type.DEBUG.toString(), (d) => {
        //   this.debugItems.forEach((item: any) => item.destroy());
        //   this.debugItems = [];
        //   d.forEach((point) => {
        //     console.log(point);
        //     if (point.x) this.debugItems.push(this.add.circle(point.x, point.y, 5, 0xff0000, 1).setDepth(3));
        //     else this.debugItems.push(this.add.circle(point[0], point[1], 5, 0xff0000, 1).setDepth(3));
        //   });
        // });

        this.ws.on(Packet.ServerHeaders.CLIENT_DIED.toString(), (kills, killer) => {
            //this.events.emit('crash', 'You died.');
            this.events.emit('death', 'You ded', kills, killer, this.gameStats.coins);
        });


        this.players = new Map();
        this.coins = new Map();
        this.chests = new Map();
        this.leaderboard = new Leaderboard(this, 0, 0);
        this.gameStats = new GameStats(this, 0, 0);
        this.miniMap = new MiniMap(this, 1280-10, 720-10);
        this.levelBar = new LevelBar(this, 1280 - 10 - 300 - (1280/1.5),720 - 50, 1280/1.5, 40);
        this.gameStats.render();
        this.cameras.main.ignore([this.leaderboard, this.gameStats, this.miniMap, this.levelBar]);
        this.levelUpMessage = null;

        this.ws.on(Packet.ServerHeaders.LEADERBOARD.toString(), (data) => {
            this.leaderboard.setLeaderboard(data);
        });

        this.ws.on(Packet.ServerHeaders.COIN_COUNT.toString(), ({count, id}) => {
            let updated = this.leaderboard.lbData.map((d) => {
                if(d.id == this.ws.id) {
                    d.coins = count;
                }
                return d;
            });
            this.leaderboard.setLeaderboard(updated);
            this.gameStats.setCoins(count);
        });

        this.ws.on(Packet.ServerHeaders.KILL_COUNT.toString(), ({count}) => {
            this.gameStats.setKills(count);
        });

        this.ws.on(Packet.ServerHeaders.CREATE_CHEST.toString(), ({ id, x, y, value, health, maxHealth }) => {
            const chest = new Chest(this, id, x, y, value, health)
            chest.setDepth(2);
            this.chests.set(id, chest);
            console.log(chest);
            this.UICamera.ignore(chest);
        });

        this.ws.on(Packet.ServerHeaders.CHEST_HEALTH.toString(), ({ id, health, maxHealth }) => {
            const chest = this.chests.get(id);
            if (chest) {
                chest.setReceived();
                chest.setHealth(health);
            }
        });

        this.ws.on(Packet.ServerHeaders.REMOVE_CHEST.toString(), ({ id }) => {
            // Destroy chest
            this.chests.get(id)?.destroy();
            this.chests.delete(id);
        });


    }

    start() {
        // Initialize grass
        this.grass = this.add
            .tileSprite(1280 / 2, 720 / 2, 1280, 720, 'grass')
            .setOrigin(0.5, 0.5)
            .setScale(0.25, 0.25)
            .setScrollFactor(0, 0)
            .setDepth(1);
        this.UICamera.ignore([this.grass])

    }

    get myPlayer() {
        return this.players.get(this.ws.id);
    }

    interpolate(delta: number) {
        const renderTime = Date.now() - (1000 / constants.expected_tps);

        for (const player of this.players.values()) {
            const posBuffer = player.possitionBuffer;

            while (posBuffer.length >= 2 && posBuffer[1][0] <= renderTime) {
                addPositionBuffer(posBuffer.shift() as any)
            }
            if (posBuffer.length >= 2 && posBuffer[0][0] <= renderTime && renderTime <= posBuffer[1][0] ) {
                const timestamp1 = posBuffer[0][0]
                const timestamp2 = posBuffer[1][0]
                const lerpFactor = (renderTime - timestamp1) / (timestamp2 - timestamp1)

                const newX = posBuffer[0][1] + (posBuffer[1][1] - posBuffer[0][1]) * lerpFactor
                const newY = posBuffer[0][2] + (posBuffer[1][2] - posBuffer[0][2]) * lerpFactor
                const newRotation = lerpTheta( posBuffer[0][3], posBuffer[1][3], lerpFactor)

                player.setPosition(newX,newY);

                // show no interpolation
                // player.setPosition(posBuffer[1][1], posBuffer[1][2])

                if (player !== this.myPlayer)
                    player.forceSetDirection(newRotation * (180 / Math.PI))

            }
        }
    }

    updateGrass() {
        const { myPlayer } = this;
        if (!myPlayer) return;

        this.grass.width = 1280 / this.cameras.main.zoom / this.grass.scale;
        this.grass.height = 720 / this.cameras.main.zoom / this.grass.scale;

        let show = 500;
        show += myPlayer.scale * myPlayer.player.width * 1.5;
        // var oldZoom = this.cameras.main.zoom;
        const newZoom = Math.max(this.scale.width / show, this.scale.height / show);
        this.cameras.main.setZoom(newZoom);

        this.grass.setTileScale(this.cameras.main.zoom);
        this.grass.setTilePosition(this.cameras.main.scrollX / this.cameras.main.zoom / this.grass.scale, this.cameras.main.scrollY / this.cameras.main.zoom / this.grass.scale);
    }

    update(time: number, delta: number) {
        // Return if still connecting
        const { myPlayer } = this;
        if (this.connectingText.visible || !myPlayer) return;
        // Do game logic below
        this.updateGrass();

        this.interpolate(delta);
        // this.myPlayer.x += 1;

        this.controllerUpdate();
    }
}
