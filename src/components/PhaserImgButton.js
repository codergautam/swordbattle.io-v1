import Phaser from "phaser";
export default class ImgButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, key, onClick) {
        super(scene);

        this.scene = scene;
        this.x = x;
        this.y = y;

        this.btn = scene.add.image(x, y, key).setOrigin(0);

        this.btn.setInteractive().on("pointerdown", onClick);
    }
    get width() {
        return this.btn.width;
    }
    get height() {
        return this.btn.height;
    }
    update(x,y) {
        if(x) {
        this.x = x;
        this.btn.x = x;
        }
        if(y) {
        this.y = y;
        this.btn.y = y;
        }
    } 
    destroy() {
        this.btn.destroy();
    }
}