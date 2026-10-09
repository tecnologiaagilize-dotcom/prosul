import type { CSSProperties } from "react";
/** Enquadramento salvo na foto: fx/fy = posição (0–100 %), zoom = 1 a 3. */
export function framing(data: Record<string, string | undefined>) {
  const clamp = (v: number, a: number, b: number) =>
    Math.min(b, Math.max(a, Number.isFinite(v) ? v : a));
  return {
    fx: clamp(Number(data.fx ?? 50), 0, 100),
    fy: clamp(Number(data.fy ?? 50), 0, 100),
    zoom: clamp(Number(data.zoom ?? 1), 1, 3),
  };
}
export function framingStyle(f: {
  fx: number;
  fy: number;
  zoom: number;
}): CSSProperties {
  const pos = `${f.fx}% ${f.fy}%`;
  return {
    objectFit: "cover",
    objectPosition: pos,
    transform: `scale(${f.zoom})`,
    transformOrigin: pos,
  };
}
