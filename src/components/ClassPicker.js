import Phaser from "phaser";
import EventEmitter from "eventemitter3";
export default class ClassPicker extends EventEmitter {
  constructor(scene) {
    super();
//    this.draw(scene);
this.text1 = "Berserker";
this.text2 = "Tank";
  }
  draw(scene) {
    this.clear();
    console.log("ClassPicker draw", this.text1, this.text2);
    this.shown = true;
   var rect = new Phaser.Geom.Rectangle(scene.canvas.width/2, scene.canvas.height/20, scene.canvas.width/7, scene.canvas.height/5);
    var rect2 = new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height);
  var gap = scene.canvas.width/10;
  rect.x -= rect.width/2;
  rect2.x -= rect2.width/2;
  rect2.x += gap;
  rect.x -= gap;

  this.rect1 = new Phaser.GameObjects.Graphics(scene, {fillStyle: {color: 0x21991d}}).setDepth(99);
  this.rect1.fillRectShape(rect);
 // this.classGraphic.fillRectShape(rect2);
  this.rect1.setDepth(50);
  this.rect1.setAlpha(0.9);
  this.rect1.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
this.textObj1=  scene.add.text(rect.x + rect.width/2, rect.y + rect.height, this.text1, {fontSize: "100px", color: "#000000" }).setOrigin(0.5, 1).setDepth(100);
this.imgObj1 = scene.add.image(rect.x + rect.width/2, rect.y, this.text1+"Player").setOrigin(0.5,0).setDepth(100).setScale(10);
var fontSize1 = 100;
while(this.textObj1.width>rect.width && this.textObj1.height>rect.height/10) {
  fontSize1=Math.floor(fontSize1*.9);
 // console.log(fontSize);
  this.textObj1.setFontSize(fontSize1);
}

while(this.imgObj1.displayWidth>rect.width || this.imgObj1.displayHeight>rect.height/1.3) {
  this.imgObj1.setScale(this.imgObj1.scale*.9);
}

  scene.add.existing(this.rect1);

  this.rect2 = new Phaser.GameObjects.Graphics(scene, {fillStyle: {color: 0x21991d}}).setDepth(99);
  this.rect2.fillRectShape(rect2);
  this.rect2.setDepth(50);
  this.rect2.setAlpha(0.9);
  this.rect2.setInteractive(rect2, Phaser.Geom.Rectangle.Contains);
  this.textObj2=  scene.add.text(rect2.x + rect2.width/2, rect2.y + rect2.height, this.text2, {fontSize: "100px", color: "#000000" }).setOrigin(0.5, 1).setDepth(100);
  this.imgObj2 = scene.add.image(rect2.x + rect2.width/2, rect2.y, this.text2+"Player").setOrigin(0.5,0).setDepth(100).setScale(10);
  var fontSize2 = 100;
  while(this.textObj2.width>rect2.width){
    fontSize2=Math.floor(fontSize2*.9);
   // console.log(fontSize);
    this.textObj2.setFontSize(fontSize2);
  }
  while(this.imgObj2.displayWidth>rect2.width || this.imgObj2.displayHeight>rect2.height/1.3) {
    this.imgObj2.setScale(this.imgObj2.scale*.9);
  }
  this.textObj1.setFontSize(Math.min(fontSize1, fontSize2));
  this.textObj2.setFontSize(Math.min(fontSize1, fontSize2));
  scene.add.existing(this.rect2);


  scene.cameras.main.ignore(this.rect1);
  scene.cameras.main.ignore(this.rect2);
  scene.cameras.main.ignore(this.textObj1);
  scene.cameras.main.ignore(this.textObj2);
  scene.cameras.main.ignore(this.imgObj1);
  scene.cameras.main.ignore(this.imgObj2);
  
  
  //onclick
  this.rect1.on("pointerdown", function (pointer) {
    this.emit("class-selected", this.text1);
  }, this);

  this.rect2.on("pointerdown", function (pointer) {
    this.emit("class-selected", this.text2);
  }, this);
  }
  clear() {
    this.rect1?.destroy();
    this.rect2?.destroy();
    this.textObj1?.destroy();
    this.textObj2?.destroy();
    this.imgObj1?.destroy();
    this.imgObj2?.destroy();

    this.shown = false;
  }
  setEvoQueue(evoQueue) {
      this.text1 = evoQueue[0][0];
      this.text2 = evoQueue[0][1];

  }

  update() {
  //  console.log("ClassPicker update");
    
  }
}