export default class Border extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        let mWidth = 1000;
        let sWidth = 10;
        const border = new Phaser.GameObjects.Graphics(scene);
        border.lineStyle(mWidth, 0x016400, 1);
        border.strokeRect(-0.5*mWidth, -0.5*mWidth, width+(mWidth/2), height+(mWidth/2));
        border.lineStyle(sWidth, 0x044d03, 1);
        border.strokeRect(-0.5*sWidth, -0.5*sWidth, width+(sWidth/2), height+(sWidth/2));
        this.add(border);
        scene.add.existing(this);
    }
}