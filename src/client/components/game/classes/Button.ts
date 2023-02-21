export default class Button extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text;
  background: Phaser.GameObjects.Rectangle;
  callback: () => void;
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, backgroundColor: string, color: string, paddingLeftandRight: number, paddingUpandDown: number, callback: () => void, hover: () => void, hoverOut: () => void, callbackContext: any) {
      super(scene, x, y);
      this.text = new Phaser.GameObjects.Text(scene, 0, 0, text, { color: color, fontSize: '32px', fontFamily: 'Arial' }).setOrigin(0.5, 0.5);
      this.background = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.text.displayWidth + (paddingLeftandRight), this.text.displayHeight + (paddingUpandDown), parseInt(backgroundColor.replace('#', '0x'), 16)).setOrigin(0.5, 0.5);
      this.add([this.background, this.text]);
      scene.add.existing(this);
      this.background.setInteractive();
      this.background.on('pointerdown', callback, callbackContext);
      this.background.on('pointerover', hover, callbackContext);
      this.background.on('pointerout', hoverOut, callbackContext);
      this.callback = callback;
  }
}