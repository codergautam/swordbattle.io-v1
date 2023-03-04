import Levels from "../../../../shared/Levels";
import MainGame from "../scenes/MainGame";
import HealthBar from "./HealthBar";

export default class LevelBar extends Phaser.GameObjects.Container {
  bar: HealthBar;
  text: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);

    this.bar = new HealthBar(scene, 0, 0, width, height, true);
    this.text = new Phaser.GameObjects.Text(scene, width/2, -1*height, "Level 0 (0%)", {
      fontFamily: "Arial",
      fontSize: "50px",
      color: "#000000",
    }).setOrigin(0.5, 0.5);
    this.bar.draw();
    this.add(this.bar);
    this.add(this.text);
    scene.add.existing(this);
  }

  setProgress(value: number) {
  }

  preUpdate() {
    this.bar.update();

    let scene = this.scene as MainGame;
    let coins = scene.gameStats.coins;
    let level = [...Levels].reverse().findIndex((level) => level.coins <= coins);
    if(level == -1) return;
    level = Levels.length - level - 1;
    let levelData = Levels[level];
    if(level == Levels.length-1) {
      this.text.setText(`Level ${level} (MAX LEVEL)`);
      this.bar.setLerpValue(100);
      return;
    }
    let nextLevelData = Levels[level+1];
    let progress = (coins - levelData.coins) / (nextLevelData.coins - levelData.coins);
    this.text.setText(`Level ${level} (${Math.round(progress*100)}%)`);
    this.bar.setLerpValue(progress*100);
  }
}