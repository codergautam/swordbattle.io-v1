import Quadtree from '@timohausmann/quadtree-js';
import intersects from 'intersects';
import clamp from '../../shared/clamp';
import Evolutions from '../../shared/Evolutions';
import Levels from '../../shared/Levels';
import Packet from '../../shared/Packet';
import constants from '../helpers/constants';
import getRandomInt from '../helpers/getRandomInt';
import Room from './Room';
import WsRoom from './WsRoom';
import roomlist from '../helpers/roomlist';
import Coin from './Coin';
import movePointAtAngle from '../helpers/movePointAtAngle';
import { getPointOnCircle } from '../helpers/getPointOnCircle';
import { StreamWriter } from '../../shared/lib/BitStream';
import { SPacketWriter } from '../packets/packet';
import { KeyStates } from '../../shared/KeyStates';
import idGen from '../helpers/idgen';
import Chest from './Chest';

export default class Player {
    name: string;
    pos: { x: number; y: number };
    angle: number;
    scale: number;
    evolution: number;
    swinging: boolean;
    swordThrown: boolean;
    wsRoom!: WsRoom;
    id: any;
    force: number;
    moveDir: number;
    updated: { /*pos: boolean; rot: boolean;*/ health: boolean; swinging: boolean; level: boolean };
    speed: number;
    lastSeenEntities: Set<any>;
    roomId: string | number | undefined;
    health: number;
    maxHealth: number;
    kills: number;
    killer: string;
    streamWriter: StreamWriter;
    knockbackPlayer: any;
    knockbackStage: number;
    knockBackFrames: number = 3;
    skin: string;
    verified: boolean;
    coins: number;
    level: number;
    ai: boolean;
    joinTime: number;
    type: string;

    constructor(name: any) {
        this.name = name;
        this.roomId = undefined;
        this.pos = {
            // x: getRandomInt(constants.spawn.min, constants.spawn.max),
            // y: getRandomInt(constants.spawn.min, constants.spawn.max),
            x: 50,
            y: 50,
        };
        this.moveDir = 0;
        this.angle = 0;
        this.force = 0;
        this.scale = Levels[0].scale;
        this.evolution = Evolutions.DEFAULT;
        this.swinging = false;
        this.swordThrown = false;
        this.speed = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.coins = 0;
        this.kills = 0;
        this.killer = '';
        this.lastSeenEntities = new Set();
        this.skin = "player";
        this.verified = false; // Verified means they are logged in.
        this.level = 0;
        this.ai = false;
        this.joinTime = Date.now();
        this.type = "player";

        this.updated = {
            // pos: false,
            // rot: false,
            health: false,
            swinging: false,
            level: false
        };
        this.streamWriter = new StreamWriter();
        this.knockbackStage = 0;
    }

    get healthPercent() {
        return Math.round(clamp(this.health / this.maxHealth, 0, 1) * 100);
    }

    get room() {
        return roomlist.getRoom(this.roomId);
    }

    getRangeRadius(hit = false) {
        const base = this.scale * constants.player_radius * 2;
        const radius = hit ? base : (500 + base * 2) / 2;
        return radius;
    }

    getRangeBounds(hit = false) {
        const radius = this.getRangeRadius(hit);

        return {
            x: this.pos.x - radius,
            y: this.pos.y - radius,
            width: radius * 2,
            height: radius * 2,
        };
    }

    resetUpdated() {
        // this.updated.pos = false;
        // this.updated.rot = false;
        this.updated.health = false;
        this.updated.swinging = false;
        this.updated.level = false;
    }

    setAngle(angle: number) {
        // Make sure angle is number
        const angle1 = Number(angle);
        if (Number.isNaN(angle)) return;
        if (angle1 < -Math.PI && angle1 > Math.PI) return;
        if (this.angle !== angle1) {
            this.angle = angle1;
            // this.updated.rot = true;
        }
    }

    setForce(force: number) {
        const force1 = Number(force);

        if (Number.isNaN(force1) || force1 > 1 || force1 < 0) return;
        this.force = force1;
    }

    setMoveDir(keystate: number) {
        // Convert to radians
        const vec = { x: 0, y: 0 };
        if (keystate & KeyStates.North) vec.y -= 1;
        if (keystate & KeyStates.South) vec.y += 1;
        if (keystate & KeyStates.East) vec.x += 1;
        if (keystate & KeyStates.West) vec.x -= 1;
        // usually we would set the player's velocity to this after normalizing this vector and multiplying it my the players speed
        // but we can set this directional angle since thats how the game's currently set up
        this.moveDir = Math.atan2(vec.y, vec.x);

        // const moveDir1 = Number(moveDir);
        // if (Number.isNaN(moveDir1)) return;
        // if (moveDir < -360 && moveDir > 360) return;
        // this.moveDir = (moveDir * Math.PI) / 180;
    }

    setMoveDirRadians(moveDir: number) {
        const moveDir1 = Number(moveDir);
        if (Number.isNaN(moveDir1)) return;
        if (moveDir < -Math.PI && moveDir > Math.PI) return;
        this.moveDir = moveDir1;
    }

    setMouseDown(s: boolean) {
        //  TODO: Add cooldown
        if (this.swinging !== s) {
            this.swinging = s;
            this.updated.swinging = true;
            if (this.swinging) this.hitCheck();
        }
    }

    hitCheck() {
        const room = this.room as Room;
        const rangeBounds = this.getRangeBounds(true);
        room.quadTree.retrieve(rangeBounds).forEach((playerObj: any) => {
            const player = room.getPlayer(playerObj.id) as Player;
            if (player === undefined) {
                const chest = room.getChest(playerObj.id) as Chest;
                if (chest && this.hittingChest(chest)) {
                    let drop = chest.hit(this);
                    this.room.addCoins(drop);
                    if(drop.length > 0) {
                        // Destroy the chest
                        room.removeChest(chest.id);
                    }
                }
            } else {
                if (player.id === this.id) return;
                if (this.hittingPlayer(player)) {
                    player.takeHit(this);
                }
            }
        });
    }

    takeHit(player: Player) {
        this.health -= player.damage;
        this.health = Math.round(this.health);
        this.updated.health = true;
        this.dealKnockback(player)
        if (this.health <= 0) {
            player.increaseKillCounter();
            this.killer = player.name;
            this.die();
        }
    }

    increaseKillCounter() {
        this.kills += 1;
        SPacketWriter.KILL_COUNT(this.streamWriter, this.kills);
    }

    die() {
        SPacketWriter.CLIENT_DIED(this.streamWriter, this.kills, this.killer);
        /// set isBinary?: to true
        this.flushStream();
        this.room.removePlayer(this.id);
        idGen.removeID(this.id)
    }

    calcSwordAngle() {
        return (this.angle * 180) / Math.PI + 45;
    }

    hittingPlayer(player: Player) {
        const deep = 0;
        const angles = [-30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30];
        // const pts = [];

        for (const increment of angles) {
            let angle = this.calcSwordAngle();

            angle -= increment;

            const sword = { x: 0, y: 0 };
            const factor = (100 / (this.scale * 100)) * 1.5;
            sword.x = this.pos.x + (this.radius / factor) * Math.cos((angle * Math.PI) / 180);
            sword.y = this.pos.y + (this.radius / factor) * Math.sin((angle * Math.PI) / 180);

            var tip = movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale));
        var base = movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale)*-1.5);


            // get the values needed for line-circle-collison
            // pts.push(tip, base);

            const radius = player.radius * player.scale;

            // check if enemy and player colliding
            if (intersects.lineCircle(tip[0], tip[1], base[0], base[1], player.pos.x, player.pos.y, radius)) return true;
        }
        return false;
    }

    hittingChest(chest: Chest) {
        const angles = [-30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30];
        for (const increment of angles) {

          var angle = this.calcSwordAngle();
          angle -= increment;

          var sword = {x: 0, y: 0};
          var factor = (100/(this.scale*100))*1.5;
          sword.x = this.pos.x + (this.radius / factor) * Math.cos((angle * Math.PI) / 180);
        sword.y = this.pos.y + (this.radius / factor) * Math.sin((angle * Math.PI) / 180);

        var tip = movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale));
        var base = movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale)*-1.5);

            if( intersects.lineBox(tip[0], tip[1], base[0], base[1], chest.pos.x, chest.pos.y, chest.width, chest.height)) return true;
        }
      return false;
      }

    dealKnockback(player: Player) {
        this.knockbackPlayer = player;
        const minKb = 10;``
        const maxKb = 500;
        // calculate kb by my scale and their scale
        let kb = (player.scale / this.scale) * 100;
        kb = clamp(kb, minKb, maxKb);

        const x = Math.cos(player.angle) * kb / this.knockBackFrames;
        const y = Math.sin(player.angle) * kb / this.knockBackFrames;
        // eslint-disable-next-line no-param-reassign
        this.pos.x += x;
        // eslint-disable-next-line no-param-reassign
        this.pos.y += y;

        if (++this.knockbackStage === this.knockBackFrames) {
            this.knockbackStage = 0;
        }
        // make sure that this player will be sent their new position
        // player.updated.pos = true;
    }

    getMovementInfo() {
        return {
            pos: this.pos,
            id: this.id,
        };
    }

    getQuadTreeFormat() {
        return {
            // x: this.pos.x - this.radius,
            // y: this.pos.y - this.radius,
            x: this.pos.x,
            y: this.pos.y,
            width: this.radius * 2,
            height: this.radius * 2,
            id: this.id,
        };
    }

    get ws() {
        return this.wsRoom.getClient(this.id);
    }

    get radius() {
        return constants.player_radius * this.scale;
    }

    get damage() {
        return Math.round((80 * this.scale > 30 ? 30 + (80 * this.scale - 30) / 5 : 80 * this.scale) / 3);
    }

    getFirstSendData() {
        return {
            name: this.name,
            x: this.pos.x,
            y: this.pos.y,
            angle: this.angle,
            scale: this.scale,
            evolution: this.evolution,
            swinging: this.swinging,
            swordThrown: this.swordThrown,
            id: this.id,
            health: this.healthPercent,
        };
    }

    isCollidingWithCircle(object: Player | Coin) {
        // const cc = (p1x: number, p1y: number, r1: any, p2x: number, p2y: number, r2: any) => (r1 + r2) ** 2 > (p1x - p2x) ** 2 + (p1y - p2y) ** 2;
        return ((this.radius + object.radius) / 2) ** 2 > (this.pos.x - object.pos.x) ** 2 + (this.pos.y - object.pos.y) ** 2;
    }

    moveUpdate(delta: number) {
        // Update position based on movement direction and speed
        const expDel = 1000 / constants.expected_tps;
        const moveSpeed = this.speed * this.force * (expDel / delta);

        // cache the old position so we can check if we have moved
        const oldX = this.pos.x;
        const oldY = this.pos.y;

        this.pos.x += Math.cos(this.moveDir) * moveSpeed;
        this.pos.y += Math.sin(this.moveDir) * moveSpeed;


        // clamp this player to the world bounds
        this.pos.x = clamp(this.pos.x, this.radius/2, constants.map.width - (this.radius/2));
        this.pos.y = clamp(this.pos.y, this.radius/2, constants.map.height - (this.radius/2));
        // Do not resolve collisions if the player hasn't moved
        if (this.pos.x !== oldX || this.pos.y !== oldY) {
            const room = this.room as Room;
            const nearbyEntities = room.quadTree.retrieve(this.getQuadTreeFormat());
            // console.log("collision", nearbyEntities.length, Math.random())
            // this.updated.pos = true;

            nearbyEntities.forEach(playerObj => {
                const coin = room.getCoin((playerObj as any).id) as Coin;
                if (coin) {
                    if (this.isCollidingWithCircle(coin)) {
                        this.collectCoin(coin);
                    }
                } else {
                    const player = room.getPlayer((playerObj as any).id) as Player;
                    if (player === undefined || player.id === this.id) return;
                    // console.log("near player")

                    if (this.isCollidingWithCircle(player)) {
                        const angle = Math.atan2(this.pos.y - player.pos.y, this.pos.x - player.pos.x);
                        // Get the point of the circle we collided with
                        // BTW - I think the radius's are messed up here, we should not have to divide
                        // by 2 in isCollidingWithPlayer method. But this works, and im not touching it anymore
                        // const { x, y } = getPointOnCircle(angle, player.pos.x, player.pos.y, player.radius * 0.9);
                        const { x, y } = getPointOnCircle(angle, player.pos.x, player.pos.y, ((player.radius + this.radius) / 2) * 0.9);
                        this.pos.x = x;
                        this.pos.y = y;
                    }
                }
            });
        }
        if (this.knockbackStage !== 0 && this.knockbackStage < this.knockBackFrames) {
            this.dealKnockback(this.knockbackPlayer)
        }
    }

    isInRangeWith(otherPlayer: Player | Coin | Chest) {
        const radius = this.getRangeRadius();
        const otherRadius = otherPlayer.getRangeRadius();

        const distance = Math.sqrt((this.pos.x - otherPlayer.pos.x) ** 2 + (this.pos.y - otherPlayer.pos.y) ** 2);

        return distance < radius + otherRadius;
    }

    packets(room: Room) {
        const { quadTree } = room;
        if (!quadTree) return;
        const newSeenEntities = new Set();
        // const newSeenCoins = new Set();
        const candidates = quadTree.retrieve(this.getRangeBounds());
        // add all players we should be able to see to list
        candidates.forEach((entity: any) => {
            const player = room.getPlayer(entity.id);
            // if we are in range of the entity
            if (player && this.isInRangeWith(player)) {
                // add this entity to the seen players
                newSeenEntities.add(player.id);
            } else {
            const coin = room.getCoin(entity.id);
            if (coin && this.isInRangeWith(coin)) {
                newSeenEntities.add(coin.id);
            } else {
            const chest = room.getChest(entity.id);
            if (chest && this.isInRangeWith(chest)) {
                newSeenEntities.add(chest.id);
            }
        }
        }
        });
        // find which entities we can no longer see, write remove packet for that player
        this.lastSeenEntities.forEach(id => {
            if (!newSeenEntities.has(id)) {
                const isPlayer = !!room.getPlayer(id);
                const isCoin = !isPlayer && !!room.getCoin(id);
                if (isPlayer) {
                    // when we despawn a player because we are far away from it
                    SPacketWriter.REMOVE_PLAYER(this.streamWriter, id);
                } else if(isCoin) {
                    // when we despawn a coin because we are far away from itfw
                    SPacketWriter.REMOVE_COIN(this.streamWriter, id);
                } else {
                    SPacketWriter.REMOVE_CHEST(this.streamWriter, id);
                }
                this.lastSeenEntities.delete(id);
            }
        });

        for (let i = 0; i < candidates.length; i++) {
            const coin = room.getCoin((candidates[i] as any).id);
            if (coin && !this.lastSeenEntities.has(coin.id) && this.isInRangeWith(coin)) {
                SPacketWriter.CREATE_COIN(this.streamWriter, coin.id, coin.pos.x, coin.pos.y, coin.value)
                this.lastSeenEntities.add(coin.id)
                continue;
            }

            const chest = room.getChest((candidates[i] as any).id);
            if (chest && this.isInRangeWith(chest)) {
                if(!this.lastSeenEntities.has(chest.id) ) {
                SPacketWriter.CREATE_CHEST(this.streamWriter, chest.id, chest.pos.x, chest.pos.y, chest.type, chest.health, chest.maxHealth);
                this.lastSeenEntities.add(chest.id)
                } else if(chest.updated.health || Date.now() - chest.lastSent > 5000) {
                    SPacketWriter.CHEST_HEALTH(this.streamWriter, chest.id, chest.health);
                    chest.updated.health = false;
                }
                continue;
            }

            const player = room.getPlayer((candidates[i] as any).id);
            if (!player) continue;
            if (this.lastSeenEntities.has(player.id)) {
                SPacketWriter.UPDATE_PLAYER(this.streamWriter, player.id, player.pos.x, player.pos.y, player.angle)
                if (player.updated.health) {
                    SPacketWriter.PLAYER_HEALTH(this.streamWriter, player.id, player.healthPercent)
                }
                if (player.updated.swinging) {
                    SPacketWriter.PLAYER_SWING(this.streamWriter, player.id, player.swinging)
                }
                if(player.updated.level) {
                  SPacketWriter.PLAYER_LEVEL(this.streamWriter, player.id, player.level)
                }
            } else if (this.isInRangeWith(player)) {
                SPacketWriter.CREATE_PLAYER(this.streamWriter, player.id, player.pos.x, player.pos.y, player.angle, player.healthPercent, player.level, player.skin)
                this.lastSeenEntities.add(player.id);
            }
        }
    }
    flushStream(): boolean {
        // send 1 packet containing all types of messages
        if(!this.ws) return false;
        if (this.streamWriter.size() > 0) {
            // isBinary?: true
            this.ws.send(this.streamWriter.bytes(), true);
            this.streamWriter.reset();
            return true;
        }
        return false;
    }

    collectCoin(coin: any) {
        const room = this.room as Room;

        this.coins += coin.value;
        room.removeCoin(coin.id);
        SPacketWriter.COIN_COUNT(this.streamWriter, this.coins);
        this.room.players.array.forEach((player: Player) => {
            if (player.lastSeenEntities.has(coin.id)) {
                SPacketWriter.REMOVE_COIN(player.streamWriter, coin.id, this.id);
                player.lastSeenEntities.delete(coin.id);
            }
        })

        // Levels
        let bestLevel = [...Levels].reverse().findIndex((level) => level.coins <= this.coins);
        if (bestLevel === -1) return;
        // Convert bestLevel to un-reversed index
        bestLevel = Levels.length - bestLevel - 1;
        if (bestLevel > this.level) {
            let levelData = Levels[bestLevel];
            this.level = bestLevel;
            this.scale = levelData.scale;
            this.updated.level = true;
        }
      }

}
