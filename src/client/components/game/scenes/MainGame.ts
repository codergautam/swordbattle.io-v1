/* eslint-disable max-len */
import Phaser from 'phaser';
import Packet from '../../../../shared/Packet';
import PacketErrorTypes from '../../../../shared/PacketErrorTypes';
import Player from '../classes/Player';
import Ws from '../classes/Ws';
import controller from '../helpers/controller';
import getServerUrl from '../helpers/getServerUrl';
import levels from '../../../../shared/Levels';
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
      this.ws.send(new Packet(Packet.Type.JOIN, { name: this.passedData.name, verify: false }));
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

      const player = new Player(this, x, y, this.passedData.name, id, 'player').setDepth(2).setScale(levels[0].scale);
      this.players.set(id, player);

      // Camera centered on player
      this.cameras.main.startFollow(player);
    });

    // TODO: Test this on refresh scene
    this.ws.on(Packet.Type.PLAYER_MOVE.toString(), (d) => {
      const { id, pos } = d;
      const player = this.players.get(id);
      if (!player) return;
      player.move(pos);
    });

    this.ws.on(Packet.Type.PLAYER_ADD.toString(), (d) => {
      const { id, name, x, y, scale, angle } = d;
      const player = new Player(this, x, y, name, id, 'player', angle).setDepth(2).setScale(scale);
      this.players.set(id, player);
    });

    this.players = new Map();
  }

  start() {
    // Initialize grass
    this.grass = this.add.tileSprite((1280 / 2), (720 / 2), 1280, 720, 'grass')
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
    show += ((myPlayer.scale * myPlayer.player.width) * 1.5);
    // var oldZoom = this.cameras.main.zoom;
    const newZoom = Math.max(this.scale.width / show, this.scale.height / show);
    this.cameras.main.setZoom(
      newZoom,
    );

    this.grass.setTileScale(this.cameras.main.zoom);
    this.grass.setTilePosition(
      ((this.cameras.main.scrollX / this.cameras.main.zoom) / this.grass.scale),
      ((this.cameras.main.scrollY / this.cameras.main.zoom) / this.grass.scale),
    );
  }
}
