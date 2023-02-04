/**
 * Moves a vertex at an angle for a specific distance, 0 degrees points up and 180 degrees points down
 * @param {array} point Location on a cartesian graph formatted as [x, y]
 * @param {number} angle Angle at which a point should move in radians
 * @param {number} distance How far should the point move at the given angle in pixels?
 * @returns {array} Newly moved point formatted as [x, y]
 */
function movePointAtAngle(point: number[], angle: number, distance: number) {
  return [
    point[0] + (Math.sin(angle) * distance),
    point[1] - (Math.cos(angle) * distance),
  ];
}

export default movePointAtAngle;
