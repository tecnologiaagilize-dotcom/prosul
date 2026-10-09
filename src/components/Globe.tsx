"use client";
import { useEffect, useRef } from "react";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { atlasId, southAmerica } from "@/lib/countries";

const SA_LON = -60; // centro da América do Sul
const TILT = 18; // inclina o globo para mostrar o hemisfério sul

/**
 * Globo girando (canvas + d3-geo), com a América do Sul em destaque.
 * `highlight`: códigos ISO-2 dos países participantes (pintados em dourado).
 */
export function Globe({ highlight = [] }: { highlight?: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = highlight.join(",");

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0,
      visible = true,
      stopped = false,
      lambda = -SA_LON - 40,
      last = performance.now(),
      size = 0;
    let countries: { id: string; geo: GeoPermissibleObjects }[] = [];

    const sa = new Set(southAmerica.map(atlasId));
    const gold = new Set(highlight.map(atlasId).filter(Boolean));
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const projection = geoOrthographic().clipAngle(90).precision(0.6);
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size = canvas.clientWidth;
      canvas.width = canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      projection.translate([size / 2, size / 2]).scale(size * 0.42);
    }

    function draw() {
      const r = size * 0.42,
        c = size / 2;
      ctx.clearRect(0, 0, size, size);
      projection.rotate([lambda, TILT]);

      // atmosfera
      const glow = ctx.createRadialGradient(c, c, r * 0.95, c, c, r * 1.18);
      glow.addColorStop(0, "rgba(90,170,255,0.35)");
      glow.addColorStop(1, "rgba(90,170,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(c, c, r * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // oceano
      const sea = ctx.createRadialGradient(
        c - r * 0.35,
        c - r * 0.4,
        r * 0.1,
        c,
        c,
        r,
      );
      sea.addColorStop(0, "#14468f");
      sea.addColorStop(1, "#04173a");
      ctx.fillStyle = sea;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fill();

      // paralelos e meridianos
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // demais países
      ctx.beginPath();
      for (const k of countries)
        if (!sa.has(k.id) && !gold.has(k.id)) path(k.geo);
      ctx.fillStyle = "#24508f";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // América do Sul
      ctx.beginPath();
      for (const k of countries)
        if (sa.has(k.id) && !gold.has(k.id)) path(k.geo);
      ctx.fillStyle = "#00a443";
      ctx.shadowColor = "rgba(0,200,90,0.55)";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // países participantes
      if (gold.size) {
        ctx.beginPath();
        for (const k of countries) if (gold.has(k.id)) path(k.geo);
        ctx.fillStyle = "#ffcc29";
        ctx.shadowColor = "rgba(255,204,41,0.6)";
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      // brilho e sombra de volume
      const shade = ctx.createRadialGradient(
        c - r * 0.4,
        c - r * 0.45,
        0,
        c,
        c,
        r,
      );
      shade.addColorStop(0, "rgba(255,255,255,0.18)");
      shade.addColorStop(0.55, "rgba(255,255,255,0)");
      shade.addColorStop(1, "rgba(0,0,20,0.45)");
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame(now: number) {
      const dt = Math.min(64, now - last);
      last = now;
      // gira mais devagar quando a América do Sul está de frente
      const d = ((((lambda + SA_LON) % 360) + 540) % 360) - 180;
      const ease = 0.22 + 0.78 * ((1 - Math.cos((d * Math.PI) / 180)) / 2);
      lambda += dt * 0.012 * ease;
      draw();
      if (visible && !stopped) raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduce && !stopped) {
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    });

    import("world-atlas/countries-110m.json").then(async (m) => {
      const { feature } = await import("topojson-client");
      const topo = (m.default ?? m) as any;
      const fc = feature(topo, topo.objects.countries) as any;
      countries = fc.features.map((f: any) => ({ id: String(f.id), geo: f }));
      if (stopped) return;
      resize();
      if (reduce) {
        lambda = -SA_LON;
        draw();
      } else io.observe(canvas);
    });
    resize();
    draw();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <canvas
      ref={ref}
      className="globe"
      role="img"
      aria-label="Globo terrestre girando, com a América do Sul em destaque"
    />
  );
}
