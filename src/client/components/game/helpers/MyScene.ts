export default interface MyScene extends Phaser.Scene {
  resize(gameSize: {width: number; height: number;});
}