"use client";

import { COUNTRIES } from "@/lib/data";

type RouteMapProps = {
  selected?: string | null;
  onSelect?: (name: string | null) => void;
  linkBase?: string;
};

// A treaty route: ten stations strung along a dashed line, alternating
// above/below like stamps on a shipping manifest. Doubles as the
// country filter used on the directory page.
export function RouteMap({ selected, onSelect, linkBase }: RouteMapProps) {
  const n = COUNTRIES.length;
  const width = 1040;
  const height = 220;
  const marginX = 60;
  const y = height / 2;
  const step = (width - marginX * 2) / (n - 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Países do Prosul, estação a estação"
    >
      <line
        x1={marginX}
        y1={y}
        x2={width - marginX}
        y2={y}
        stroke="var(--line)"
        strokeWidth={2}
        className="route-dash"
      />
      {COUNTRIES.map((c, i) => {
        const x = marginX + step * i;
        const up = i % 2 === 0;
        const isSelected = selected === c.name;
        const labelY = up ? y - 26 : y + 40;
        const content = (
          <g key={c.code} className="cursor-pointer group">
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={up ? y - 14 : y + 14}
              stroke="var(--line)"
              strokeWidth={2}
            />
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 8 : 6}
              fill={isSelected ? "var(--gold)" : "var(--ink-panel-raised)"}
              stroke="var(--gold)"
              strokeWidth={2}
              className="transition-all duration-200 group-hover:fill-[var(--gold)]"
            />
            <text
              x={x}
              y={labelY}
              textAnchor="middle"
              className="font-mono transition-opacity"
              style={{
                fill: isSelected ? "var(--gold)" : "var(--text-on-dark-dim)",
                fontSize: "11px",
                letterSpacing: "0.02em",
              }}
            >
              {c.name}
            </text>
            <text
              x={x}
              y={up ? y - 26 - 14 : y + 40 + 16}
              textAnchor="middle"
              className="font-mono"
              style={{ fill: "var(--line)", fontSize: "9px" }}
            >
              {c.code}
            </text>
          </g>
        );

        if (linkBase) {
          return (
            <a
              key={c.code}
              href={`${linkBase}?pais=${encodeURIComponent(c.name)}`}
              aria-label={c.name}
            >
              {content}
            </a>
          );
        }

        return (
          <g
            key={c.code}
            onClick={() => onSelect?.(isSelected ? null : c.name)}
            tabIndex={0}
            role="button"
            aria-pressed={isSelected}
            aria-label={c.name}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(isSelected ? null : c.name);
              }
            }}
          >
            {content}
          </g>
        );
      })}
    </svg>
  );
}
