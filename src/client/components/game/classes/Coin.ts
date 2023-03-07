import dynamicSkinLoader from "../helpers/dynamicSkinLoader";
import Phaser from "phaser";
import constants from "../../../../server/helpers/constants";

export default class Coin extends Phaser.GameObjects.Container {
    id: number;
    coin: Phaser.GameObjects.Image;
    skin: string;
    constructor(scene: Phaser.Scene, id: number, x: number, y: number, value: number) {
        super(scene, x, y);
        this.id = id;
        this.skin = "coin";

            this.coin = new Phaser.GameObjects.Image(this.scene, 0, 0, "coin").setScale((0.1 + (Math.min(value, constants.coin.max_value) / 30)))
            this.add(this.coin);

        this.addToUpdateList();
        this.scene.add.existing(this);
    }

    // eslint-disable-next-line class-methods-use-this
    // preUpdate() {
    // }
}