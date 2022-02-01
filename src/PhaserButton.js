
export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, fontSize, color, onClick) {
        super(scene);

        this.scene = scene;
        this.x = x;
        this.y = y;

        this.btnrect = scene.add.rectangle(0, 0, 0, 0, 0x6666ff);
        this.btntext = scene.add.text(x, y, text, {
            fontSize: fontSize,
            fill: "#000000"
        }).setOrigin(0);
        this.btnrect.x = this.btntext.x - 5;
        this.btnrect.y = this.btntext.y - 5;
        this.btnrect.width = this.btntext.width + 10;
        this.btnrect.height = this.btntext.height + 10;

        this.btnrect.setInteractive().on("pointerdown", onClick);
    }
    update(x,y) {
        this.x = x;
        this.y = y;
        this.btntext.x = x;
        this.btntext.y = y;
        this.btnrect.x = this.btntext.x  - 5;
        this.btnrect.y = this.btntext.y  - 5;
        this.btnrect.width = this.btntext.width + 10;
        this.btnrect.height = this.btntext.height + 10;
    } 
    destroy() {
        this.btnrect.destroy();
        this.btntext.destroy();
    }
}