import { KeyStates } from '../../../../shared/KeyStates';

interface controller {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}

export { controller };

export default (c: controller) => {
    let direction = 0;
    if (c.up) direction |= KeyStates.North;
    if (c.down) direction |= KeyStates.South;
    if (c.left) direction |= KeyStates.West;
    if (c.right) direction |= KeyStates.East;
    return direction;
    // let angle = 0;
    // if (c.up && c.left) angle = 225;
    // else if (c.up && c.right) angle = 315;
    // else if (c.down && c.left) angle = 135;
    // else if (c.down && c.right) angle = 45;
    // else if (c.up) angle = 270;
    // else if (c.down) angle = 90;
    // else if (c.left) angle = 180;
    // else if (c.right) angle = 0;
    // return angle;
};
