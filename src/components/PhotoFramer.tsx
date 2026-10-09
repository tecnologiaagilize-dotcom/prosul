"use client";
import { useEffect, useRef } from "react";
import { framingStyle } from "@/lib/framing";

type V = { fx: number; fy: number; zoom: number };

/** Enquadrar foto: arrastar move (horizontal/vertical), roda do mouse ou controle dá zoom. */
export function PhotoFramer({
  url,
  fx,
  fy,
  zoom,
  onChange,
}: V & { url: string; onChange: (v: V) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; fx: number; fy: number } | null>(
    null,
  );
  const latest = useRef<V>({ fx, fy, zoom });
  latest.current = { fx, fy, zoom };
  const clamp = (v: number, a: number, b: number) =>
    Math.round(Math.min(b, Math.max(a, v)) * 100) / 100;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const c = latest.current;
      onChange({ ...c, zoom: clamp(c.zoom - e.deltaY * 0.0015, 1, 3) });
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [onChange]);

  function move(e: React.PointerEvent) {
    if (!drag.current || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const k = 100 / Math.max(1, latest.current.zoom * 0.9);
    onChange({
      ...latest.current,
      fx: clamp(
        drag.current.fx - ((e.clientX - drag.current.x) / r.width) * k,
        0,
        100,
      ),
      fy: clamp(
        drag.current.fy - ((e.clientY - drag.current.y) / r.height) * k,
        0,
        100,
      ),
    });
  }

  return (
    <div className="framer">
      <label>Enquadramento da foto</label>
      <p className="muted">
        Arraste a imagem para mover. Use a roda do mouse ou o controle de zoom.
        Esta é a área exibida no site.
      </p>
      <div className="framer-body">
        <div
          ref={box}
          className="framer-box"
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, fx, fy };
          }}
          onPointerMove={move}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            draggable={false}
            style={framingStyle({ fx, fy, zoom })}
          />
          <span className="framer-grid" aria-hidden="true" />
        </div>
        <div className="framer-controls">
          <div>
            <label htmlFor="fr-x">Horizontal ({Math.round(fx)}%)</label>
            <input
              id="fr-x"
              type="range"
              min={0}
              max={100}
              step={1}
              value={fx}
              onChange={(e) => onChange({ fx: +e.target.value, fy, zoom })}
            />
          </div>
          <div>
            <label htmlFor="fr-y">Vertical ({Math.round(fy)}%)</label>
            <input
              id="fr-y"
              type="range"
              min={0}
              max={100}
              step={1}
              value={fy}
              onChange={(e) => onChange({ fx, fy: +e.target.value, zoom })}
            />
          </div>
          <div>
            <label htmlFor="fr-z">Zoom ({zoom.toFixed(2)}×)</label>
            <input
              id="fr-z"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => onChange({ fx, fy, zoom: +e.target.value })}
            />
          </div>
          <button
            type="button"
            className="secondary"
            onClick={() => onChange({ fx: 50, fy: 50, zoom: 1 })}
          >
            Centralizar / redefinir
          </button>
        </div>
      </div>
    </div>
  );
}
