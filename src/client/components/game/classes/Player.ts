import controller from '../helpers/controller';
import dynamicSkinLoader from '../helpers/dynamicSkinLoader';
import MainGame from '../scenes/MainGame';
import constants from '../../../../server/helpers/constants';
import lerpTheta from '../helpers/angleInterp';
import HealthBar from './HealthBar';

export default class Player extends Phaser.GameObjects.Container {
    id: string;
    skin: string;
    player: Phaser.GameObjects.Image;
    sword: Phaser.GameObjects.Image;
    mySelf: boolean;
    dir: number;
    force: number;
    lastUpdate: number;
    mouseDownState: boolean;
    mouseDownValue: number;
    swingQueued: boolean;
    nameTag: Phaser.GameObjects.Text;
    healthBar: HealthBar;
    trueAngle: number;

    constructor(scene: Phaser.Scene, x: number, y: number, name: string, id: string, skin: string, angle?: number) {
        super(scene, x, y);
        this.name = name;
        this.nameTag = new Phaser.GameObjects.Text(scene, 0, 0, name, {
            fontFamily: 'Arial',
            fontSize: '100px',
            color: '#000000',
        }).setOrigin(0.5, 0);
        this.healthBar = new HealthBar(scene, 0, 0, 100, 10);
        this.id = id;
        this.skin = skin;
        this.mySelf = (this.scene as MainGame).ws.id === this.id;
        this.lastUpdate = Date.now();
        this.mouseDownState = false;
        this.mouseDownValue = 0;

        dynamicSkinLoader(this.scene, this.skin).then(data => {
            this.player = new Phaser.GameObjects.Image(this.scene, 0, 0, data.skin).setScale(0.5);
            this.sword = new Phaser.GameObjects.Image(this.scene, 0, 0, data.sword).setScale(0.5);

            this.add([this.player, this.sword, this.healthBar]);

            this.nameTag.y = this.player.displayHeight + this.nameTag.displayHeight + 10;
            this.healthBar.x = -this.healthBar.displayWidth / 2;
            this.healthBar.y = this.player.displayHeight + this.nameTag.displayHeight + 10;
            this.healthBar.draw();
            this.add(this.nameTag);
            if (this.mySelf) {
                controller(this.scene as MainGame);
            } else if (this.angle !== undefined) {
                const rads = Phaser.Math.RadToDeg(this.angle);
                this.setDirection(rads);
            }
        });

        this.addToUpdateList();
        this.scene.add.existing(this);
    }

    forceSetDirection(angle1: number) {
        this.trueAngle = angle1;
        const angle = angle1 - this.mouseDownValue;
        this.sword.angle = angle + 45;
        this.player.angle = angle;
        this.sword.x = this.player.displayWidth * 0.69 * Math.cos(this.sword.rotation);
        this.sword.y = this.player.displayWidth * 0.69 * Math.sin(this.sword.rotation);
    }

    setDirection(angle1: number) {
        let angle = angle1;
        if (!this.mySelf) angle = Phaser.Math.RadToDeg(angle1);
        if (this.mySelf) {
            this.forceSetDirection(angle);
        } else {
            const startAngle = this.player.angle + this.mouseDownValue;
            this.scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 1000 / constants.expected_tps + 10,
                onUpdate: tween => {
                    const angleInterp = lerpTheta(startAngle, angle, tween.getValue());
                    this.forceSetDirection(angleInterp);
                },
            });
        }
    }

    setMouseDown(value: boolean) {
        if (this.mouseDownState !== value && (this.mouseDownValue === 0 || this.mouseDownValue === 50)) {
            this.mouseDownState = value;
        } else if (this.mouseDownValue !== 0 && this.mouseDownValue !== 50) {
            this.swingQueued = true;
        }
    }

    move(pos: { x: number; y: number }) {
        this.scene.tweens.add({
            targets: this,
            x: pos.x,
            y: pos.y,
            // old movement
            // duration: 1000 / constants.expected_tps + 50,
            // ease: 'Power2',
            // new movement
            duration: 1000 / constants.expected_tps,
            ease: 'Linear',
        });
    }

    setHealth(h: number) {
        this.healthBar.setHealth(h);
    }
    // eslint-disable-next-line class-methods-use-this
    preUpdate() {
        const delta = Date.now() - this.lastUpdate;
        const ms = 200 / 2;
        this.lastUpdate = Date.now();
        if ((this.mouseDownState && this.mouseDownValue !== 50) || (!this.mouseDownState && this.mouseDownValue !== 0)) {
            // ms is the time it takes to swing the sword
            this.mouseDownValue += (this.mouseDownState ? 1 : -1) * (delta * (50 / ms));
            this.mouseDownValue = Math.min(Math.max(this.mouseDownValue, 0), 50);
            if (this.mouseDownValue === 0 || this.mouseDownValue === 50) {
                if (this.swingQueued) {
                    this.swingQueued = false;
                    this.setMouseDown(!this.mouseDownState);
                }
            }
            if (this.mySelf) {
                const mousePos = this.scene.input.mousePointer;
                const angle = (Math.atan2(mousePos.y - 720 / 2, mousePos.x - 1280 / 2) * 180) / Math.PI;
                this.setDirection(angle);
            } else {
                this.forceSetDirection(this.trueAngle);
            }
        }

        if (this.player.visible) {
            this.nameTag.setFontSize(125 * this.player.scale);
            this.healthBar.width = this.player.displayWidth;
            this.healthBar.height = this.player.displayHeight / 10;
            this.healthBar.x = -this.healthBar.displayWidth / 2;
            this.healthBar.y = this.player.y - this.player.displayHeight / 2 - this.healthBar.height;
            this.nameTag.y = this.healthBar.y - this.nameTag.displayHeight;
            this.healthBar.draw();
        }
    }
}
