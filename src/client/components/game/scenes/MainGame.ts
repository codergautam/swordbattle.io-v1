/* eslint-disable max-len */
import Phaser from 'phaser';
import Packet from '../../../../shared/Packet';
import PacketErrorTypes from '../../../../shared/PacketErrorTypes';
import Ws from '../classes/Ws';
import getServerUrl from '../helpers/getServerUrl';
import { PassedData } from '../helpers/helperTypes';
// eslint-disable-next-line no-unused-vars

export default class MainGame extends Phaser.Scene {
  background: Phaser.GameObjects.Image;
  ws: Ws;
  connectingText: Phaser.GameObjects.Text;
  passedData: { name: string, keys: boolean, volume: number };
  constructor() {
    super('maingame');
  }
  init(data: PassedData) {
    this.passedData = data;
  }

   preload() {
    this.background = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(0.7);
    
    this.connectingText = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, 'Connecting...', { fontSize: '64px', color: '#fff', fontFamily:'Hind Madurai, Arial' }).setOrigin(0.5, 0.5).setScrollFactor(0, 0).setScale(1);
  
    this.tweens.add({
      targets: this.connectingText,
      alpha: 0,
      duration: 1000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });
    
  }

   create() {

    this.ws = new Ws(getServerUrl());

    this.ws.once('connect_error', (reason: string) => {
      this.events.emit('crash', reason);
    });

    this.ws.once('connected', () => {
      this.connectingText.destroy();
      this.ws.send(new Packet(Packet.Type.JOIN, { name: this.passedData.name, keys: this.passedData.keys, verify: false }));
    });

    this.ws.once(Packet.Type.ERROR.toString(), ([code]) => {
      // console.log(PacketErrorTypes);
       const values = Object.values(PacketErrorTypes);
      const error = values.find((value) => value.code === code);
      this.events.emit('crash', error ? error.message : 'An unknown error occured.');

    });


   }

  update() {
  }
}
