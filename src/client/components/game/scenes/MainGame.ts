/* eslint-disable max-len */
import Phaser from 'phaser';
import Packet from '../../../../shared/Packet';
import PacketErrorTypes from '../../../../shared/PacketErrorTypes';
import Player from '../classes/Player';
import Ws from '../classes/Ws';
import controller from '../helpers/controller';
import getServerUrl from '../helpers/getServerUrl';
// eslint-disable-next-line no-unused-vars

export default class MainGame extends Phaser.Scene {
  loadBg: Phaser.GameObjects.Image;
  ws: Ws;
  connectingText: Phaser.GameObjects.Text;
  passedData: { name: string, keys: boolean, volume: number };
  players: Map<any, Player>;
  grass: Phaser.GameObjects.TileSprite;
  constructor() {
    super('maingame');
  }
  init(data: any) {
    this.passedData = data;
  }

  preload() {
    this.loadBg = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(0.7);

    this.connectingText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Connecting...', { fontSize: '64px', color: '#fff', fontFamily: 'Hind Madurai, Arial' }).setOrigin(0.5, 0.5).setScrollFactor(0, 0).setScale(1);

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

    this.ws.once('connected', () => {
      this.ws.send(new Packet(Packet.Type.JOIN, { name: this.passedData.name, keys: this.passedData.keys, verify: false }));
    });

    this.ws.once(Packet.Type.ERROR.toString(), ([code]) => {
      // console.log(PacketErrorTypes);
      const values = Object.values(PacketErrorTypes);
      const error = values.find((value: any) => value.code === code);
      this.events.emit('crash', error ? (error as any).message : 'An unknown error occured.');
    });

    this.ws.once(Packet.Type.JOIN.toString(), ([id, x, y]) => {
      this.ws.id = id;
      this.connectingText.destroy();
      this.loadBg.destroy();
      this.start();

      const player = new Player(this, x, y, this.passedData.name, id, 'player').setDepth(2);
      this.players.set(id, player);

      // Camera centered on player
      this.cameras.main.startFollow(player);
    });

    this.players = new Map();

    this.cameras.main.zoomTo(0.5, 5000);
  }

  start() {
    // Initialize grass
    this.grass = this.add.tileSprite((1280 / 2), (720 / 2), 1280, 720, 'grass')
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0, 0)
      .setDepth(1);
  }

  get myPlayer() {
    return this.players.get(this.ws.id);
  }

  update(time: number, delta: number) {
    // Return if still connecting
    if (this.connectingText.visible) return;
    // Do game logic below
    if (this.myPlayer) {
      // this.myPlayer.x += 1;
      console.log(this.myPlayer.x);
      this.grass.width = 1280 / this.cameras.main.zoom;
      this.grass.height = 720 / this.cameras.main.zoom;
    }

    this.grass.setTilePosition(
      (this.cameras.main.scrollX),
      (this.cameras.main.scrollY),
    );

    this.grass.setTileScale(this.cameras.main.zoom);
  }
}
