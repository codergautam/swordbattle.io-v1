export default class ImageButton extends Phaser.GameObjects.Container {
    button: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, callback: () => void, hover: () => void, hoverOut: () => void, callbackContext: any) {
        super(scene, x, y);
        this.button = new Phaser.GameObjects.Image(scene, 0, 0, texture).setOrigin(0.5, 0.5);
        this.add(this.button);
        scene.add.existing(this);
        this.button.setInteractive();
        this.button.on('pointerdown', callback, callbackContext);
        this.button.on('pointerover', hover, callbackContext);
        this.button.on('pointerout', hoverOut, callbackContext);
    }
}