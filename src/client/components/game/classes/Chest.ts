import dynamicSkinLoader from "../helpers/dynamicSkinLoader";
import Phaser from "phaser";
import HealthBar from "./HealthBar";

export default class Chest extends Phaser.GameObjects.Container {
    id: number;
    skin: string;
  chestType: number;
  chestImage: any;
  healthBar: HealthBar;
  health: number;
  idText: Phaser.GameObjects.Text;
  lastReceived: number;
    constructor(scene: Phaser.Scene, id: number, x: number, y: number, type: number, health: number) {
        super(scene, x, y);
        this.id = id;
        this.chestType = type;
        this.health = health;

        let raritys = [
          {
            scale: 0.5,
            drop: [50,100],
            health: 1
          },
          {
            scale: 0.65,
            drop: [100,250],
            health: 25
          },
          {
            scale: 0.75,
            drop: [250,500],
            health: 50,
          },
          {
            scale: 1,
            drop: [500,1000],
            health:  150
          },
          {
            scale: 1.5,
            drop: [1000,2500],
            health: 350
          },
          {
            scale: 2.25,
            drop: [5000,10000],
            health: 750
          }
        ];
        console.log("chest" + type);

        this.chestImage = new Phaser.GameObjects.Image(this.scene, 0, 0, "chest" + type).setScale(0.5).setOrigin(0, 0);
        this.add(this.chestImage);

        this.width = 352;
        this.height = 223;
        this.scale = raritys[type-1].scale;
        this.idText = new Phaser.GameObjects.Text(this.scene, 0, 0, id.toString(), { fontSize: "20px" });
        this.healthBar = new HealthBar(this.scene, 0, 0, this.chestImage.displayWidth, 10);
        this.lastReceived = Date.now();
        this.add(this.healthBar);
        this.healthBar.maxValue = raritys[type-1].health;
        this.healthBar.value = health;
        if(this.healthBar.maxValue > 1) this.healthBar.draw();

        this.add(this.idText);

        this.scene.add.existing(this);
    }

    setHealth(health: number) {
        this.health = health;
        this.healthBar.value = this.health;
        console.log("set health of type " + this.chestType + " to " + this.health)
        if(this.healthBar.maxValue > 1) this.healthBar.draw();
    }

    setReceived() {
        this.lastReceived = Date.now();
    }

    // eslint-disable-next-line class-methods-use-this
    preUpdate() {
        if (Date.now() - this.lastReceived > 7000) {
            this.destroy();
        }
    }
}