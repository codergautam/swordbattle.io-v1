export function getPointOnCircle(angle: number, x: number, y: number, radius: number): { x: number; y: number } {
    return {
        x: Math.cos(angle) * radius + x,
        y: Math.sin(angle) * radius + y,
    };
}
