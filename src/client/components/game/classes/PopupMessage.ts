import dynamicSkinLoader from "../helpers/dynamicSkinLoader";
import Phaser from "phaser";
import constants from "../../../../server/helpers/constants";

export default class PopupMessage extends Phaser.GameObjects.Container {
    text: Phaser.GameObjects.Text;t
    tween: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, text: string, x: number, y: number) {
        super(scene, x, y);
        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, text, { fontSize: "20px" });
        this.add(this.text);
        this.startTween();

        this.scene.add.existing(this);
    }

    stopTween() {
        this.tween.stop();
    }
    restartTween() {
      this.stopTween();
        this.scene.tweens.add({
            targets: this.text,
            y: 0,
            alpha: 1,
            ease: "Linear",
            duration: 100,
            onComplete: () => {
                this.startTween();
            }
        })
    }
    startTween() {

      this.tween = this.scene.tweens.add({
        targets: this.text,
        y: -30,
        alpha: 0,
        ease: "Linear",
        duration: 1000,
        repeat: 0,
        yoyo: false,
        onComplete: () => {
          console.log("tween complete");
            this.destroy();
        }
    });
    }
    // eslint-disable-next-line class-methods-use-this
    // preUpdate() {
    // }
}