import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';
import constants from '../../../../server/helpers/constants';
import MainGame from '../scenes/MainGame';


export default class MiniMap extends Phaser.GameObjects.Container {
  box: Phaser.GameObjects.Rectangle;
  players: Map<string, {goPos: {x: number, y: number; scale: number}; player: Phaser.GameObjects.Ellipse; id: string}>;
  constructor(scene: MainGame, x: number, y: number) {
    super(scene, x, y);

    this.box = new Phaser.GameObjects.Rectangle(scene, 0, 0, 200, 200, 0x00FF00).setOrigin(1, 1);
    this.players = new Map();
    this.add(this.box);
    scene.add.existing(this);

}

addPlayer(player: { x: number; y: number; scale: number; id: string; }, me: boolean) {

  let map = constants.map
  let miniMap = {
    width: this.box.displayWidth,
    height: this.box.displayHeight,
  }

  let x = (player.x / map.width) * miniMap.width;
  let y = (player.y / map.height) * miniMap.height;
  let scale = (player.scale / map.width) * miniMap.width * 10;
  let goPos = {x: player.x, y: player.y, scale: player.scale};

  let go = new Phaser.GameObjects.Ellipse(this.scene, x-200, y-200, constants.player_radius, constants.player_radius, me ? 0xFFFFFF : 0xFF0000).setScale(scale);
  this.add(go);
  console.log("Added player to minimap, ", player.id, " ", me);
  this.players.set(player.id, {goPos, player: go, id: player.id});
}

updatePlayer(id: string ,newX: number, newY: number, newScale: number, tween: boolean = false) {
  let map = constants.map
  let miniMap = {
    width: this.box.displayWidth,
    height: this.box.displayHeight,
  }

  let goPos: {x: number, y: number, scale: number} = {
    x: 0,
    y: 0,
    scale: 0
  };

  // Convert map coordinates to minimap coordinates
  let x = (newX / map.width) * miniMap.width;
  let y = (newY / map.height) * miniMap.height;
  let scale = (miniMap.width / map.width) * newScale * 10;

  goPos.x = x;
  goPos.y = y;
  goPos.scale = scale;
  let go = (this.players.get(id) as any).player;
  go.setScale(scale);
  this.players.set(id, {goPos, player: go, id});

  if(!tween) {
    go.setPosition(x-200, y-200);
  } else {
    this.scene.tweens.add({
      targets: go,
      x: x-200,
      y: y-200,
      duration: 1000,
      ease: 'Linear',
      repeat: 0,
    });
  }

}

preUpdate() {
  let gamePlayers = (this.scene as MainGame).players;
  let lbPlayers = (this.scene as MainGame).leaderboard.lbData;
  let me = (this.scene as MainGame).ws.id;
  // Both maps width and height
  let map = constants.map
  let miniMap = {
    width: this.box.displayWidth,
    height: this.box.displayHeight,
  }
  if(gamePlayers.size === 0 || !lbPlayers || lbPlayers.length == 0) return;
  gamePlayers.forEach((player: any) => {
    if(this.players.has(player.id)) {
      this.updatePlayer(player.id, player.x, player.y, player.scale);
    } else {
      this.addPlayer(player, me === player.id);
    }
  });
  lbPlayers.forEach((player: any) => {
    if(gamePlayers.has(player.id)) return;
    if(this.players.has(player.id)) {
      this.updatePlayer(player.id, player.x, player.y, player.scale, true);
    } else {
      this.addPlayer(player, me === player.id);
    }
  });


  // Remove players
  [...this.players.values()].forEach(({player, goPos, id}) => {
    if(!lbPlayers.find((p)=>p.id === id)) {
      player.destroy();
      this.players.delete(id);
    }
  });
}
}