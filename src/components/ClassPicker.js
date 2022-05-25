import Phaser from "phaser";
export default class ClassPicker {
  constructor(scene) {
   var rect = new Phaser.Geom.Rectangle(scene.canvas.width/2, scene.canvas.height/15, scene.canvas.width/7, scene.canvas.height/5);
    var rect2 = new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height);
  var gap = scene.canvas.width/10;
  rect.x -= rect.width/2;
  rect2.x -= rect2.width/2;
  rect2.x += gap;
  rect.x -= gap;



    this.classGraphic = new Phaser.GameObjects.Graphics(scene).setDepth(99);
    this.classGraphic.fillRectShape(rect);
    this.classGraphic.fillRectShape(rect2);
    this.classGraphic.setDepth(50);
    this.classGraphic.setAlpha(0.9);
    this.classGraphic.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
    scene.add.existing(this.classGraphic);
  }

  update() {
    console.log("ClassPicker update");
    
  }
}