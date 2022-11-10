const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt;
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
const repeat = (t: number, m: number) => clamp(t - Math.floor(t / m) * m, 0, m);

export default function lerpTheta(a: number, b: number, t: any) {
  const dt = repeat(b - a, 360);
  return lerp(a, a + (dt > 180 ? dt - 360 : dt), t);
}
