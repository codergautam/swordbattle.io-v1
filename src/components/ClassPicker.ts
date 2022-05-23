import Phaser from "phaser";
interface MyScene extends Phaser.Scene {
  canvas: {width: number, height: number};
}
export default class ClassPicker {
  rect1: Phaser.GameObjects.Graphics;
  constructor(scene: MyScene) {
   var rect = new Phaser.Geom.Rectangle(scene.canvas.width/2, scene.canvas.height/15, scene.canvas.width/7, scene.canvas.height/5);
    var rect2 = new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height);
  var gap = scene.canvas.width/10;
  rect.x -= rect.width/2;
  rect2.x -= rect2.width/2;
  rect2.x += gap;
  rect.x -= gap;

  this.rect1 = new Phaser.GameObjects.Graphics(scene, {fillStyle: {color: 0xffffff}}).setDepth(99);
  this.rect1.fillRectShape(rect);
 // this.classGraphic.fillRectShape(rect2);
  this.rect1.setDepth(50);
  this.rect1.setAlpha(0.9);
  this.rect1.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
  scene.add.existing(this.rect1);
  }

  update() {
    console.log("ClassPicker update");
    
  }
}