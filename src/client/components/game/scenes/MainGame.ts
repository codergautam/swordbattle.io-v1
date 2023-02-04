/* eslint-disable max-len */
import Phaser from 'phaser';
import Packet from '../../../../shared/Packet';
import PacketErrorTypes from '../../../../shared/PacketErrorTypes';
import Player from '../classes/Player';
// import Coin from '../classes/Coin';
import Ws from '../classes/Ws';
import controller from '../helpers/controller';
import getServerUrl from '../helpers/getServerUrl';
import levels from '../../../../shared/Levels';
import { createJoinPacket } from '../packets/packet';
// eslint-disable-next-line no-unused-vars

export default class MainGame extends Phaser.Scene {
    loadBg: Phaser.GameObjects.Image;
    ws: Ws;
    connectingText: Phaser.GameObjects.Text;
    passedData: { name: string; keys: boolean; volume: number };
    players: Map<any, Player>;
    grass: Phaser.GameObjects.TileSprite;
    controllerUpdate: () => void;
    debugItems: any[];
    constructor() {
        super('maingame');
    }
    init(data: any) {
        this.passedData = data;
    }

    preload() {
        // this.debugItems = [];

        this.loadBg = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(0.7);

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
            // this.ws.send(new Packet(Packet.Type.JOIN, { name: this.passedData.name, verify: false }));
            createJoinPacket(this.ws.streamWriter, this.passedData.name, false);
            this.ws.flushStream();
        });

        this.ws.once(Packet.Type.ERROR.toString(), ([code]) => {
            const values = Object.values(PacketErrorTypes);
            const error = values.find((value: any) => value.code === code);
            this.events.emit('crash', error ? (error as any).message : 'An unknown error occured.');
        });

        this.ws.once(Packet.Type.JOIN.toString(), ([id, x, y]) => {
            this.ws.id = id;
            this.connectingText.destroy();
            this.loadBg.destroy();
            this.start();

            const player = new Player(this, x, y, this.passedData.name, id, 'player').setDepth(2).setScale(levels[0].scale);
            player.setHealth(100);
            this.players.set(id, player);

            // Camera centered on player
            this.cameras.main.startFollow(player);
        });

        // TODO: Test this on refresh scene
        this.ws.on(Packet.Type.PLAYER_MOVE.toString(), d => {
            const { id, pos } = d;
            const player = this.players.get(id);
            if (!player) return;
            player.move(pos);
        });

        this.ws.on(Packet.Type.PLAYER_ROTATE.toString(), d => {
            const { id, r } = d;
            const player = this.players.get(id);
            if (!player) return;
            player.setDirection(r);
        });

        this.ws.on(Packet.Type.PLAYER_HEALTH.toString(), d => {
            const { id, health } = d;
            const player = this.players.get(id);
            if (!player) return;
            player.setHealth(health);
        });

        this.ws.on(Packet.Type.PLAYER_SWING.toString(), d => {
            const { id, s } = d;
            const player = this.players.get(id);
            if (!player) return;
            player.setMouseDown(s);
        });

        this.ws.on(Packet.Type.PLAYER_ADD.toString(), d => {
            const { id, name, x, y, scale, angle, health } = d;
            const player = new Player(this, x, y, name, id, 'player', angle).setDepth(2).setScale(scale);
            player.setHealth(health);
            this.players.set(id, player);
        });

        this.ws.on(Packet.Type.PLAYER_REMOVE.toString(), d => {
            const { id } = d;
            const player = this.players.get(id);
            if (!player) return;
            player.destroy();
            this.players.delete(id);
        });

        // this.ws.on(Packet.Type.DEBUG.toString(), (d) => {
        //   this.debugItems.forEach((item: any) => item.destroy());
        //   this.debugItems = [];
        //   d.forEach((point) => {
        //     console.log(point);
        //     if (point.x) this.debugItems.push(this.add.circle(point.x, point.y, 5, 0xff0000, 1).setDepth(3));
        //     else this.debugItems.push(this.add.circle(point[0], point[1], 5, 0xff0000, 1).setDepth(3));
        //   });
        // });

        this.ws.on(Packet.Type.DIE.toString(), (kills, killer) => {
            //this.events.emit('crash', 'You died.');
            this.events.emit('death', 'You ded', kills, killer, 0);
        });

        this.ws.on(Packet.Type.COIN.toString(), d => {
            // alert("COIN!!!!!!");
        });

        this.ws.on(Packet.Type.COIN_COLLECT.toString(), () => {
            // Coin collection event
        });

        this.players = new Map();
    }

    start() {
        // Initialize grass
        this.grass = this.add
            .tileSprite(1280 / 2, 720 / 2, 1280, 720, 'grass')
            .setOrigin(0.5, 0.5)
            .setScale(0.25, 0.25)
            .setScrollFactor(0, 0)
            .setDepth(1);
    }

    get myPlayer() {
        return this.players.get(this.ws.id);
    }

    update(time: number, delta: number) {
        // Return if still connecting
        const { myPlayer } = this;
        if (this.connectingText.visible || !myPlayer) return;
        // Do game logic below

        // this.myPlayer.x += 1;
        this.grass.width = 1280 / this.cameras.main.zoom / this.grass.scale;
        this.grass.height = 720 / this.cameras.main.zoom / this.grass.scale;

        let show = 500;
        show += myPlayer.scale * myPlayer.player.width * 1.5;
        // var oldZoom = this.cameras.main.zoom;
        const newZoom = Math.max(this.scale.width / show, this.scale.height / show);
        this.cameras.main.setZoom(newZoom);

        this.grass.setTileScale(this.cameras.main.zoom);
        this.grass.setTilePosition(this.cameras.main.scrollX / this.cameras.main.zoom / this.grass.scale, this.cameras.main.scrollY / this.cameras.main.zoom / this.grass.scale);

        this.controllerUpdate();
    }
}
