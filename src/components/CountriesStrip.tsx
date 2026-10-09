import * as flags from "country-flag-icons/string/3x2";
import { safeUrl, type Resource } from "@/lib/catalog";
import { countryName } from "@/lib/countries";

const flagSrc = (row: Resource) => {
  if (row.data.flag && safeUrl(row.data.flag)) return row.data.flag;
  const svg = (flags as Record<string, string>)[row.data.code || ""];
  return svg ? "data:image/svg+xml;utf8," + encodeURIComponent(svg) : null;
};

/** Faixa de bandeiras dos países participantes (renderizada no servidor). */
export function CountriesStrip({ rows }: { rows: Resource[] }) {
  if (!rows.length) return null;
  return (
    <section className="countries" aria-labelledby="paises-titulo">
      <div className="countries-head">
        <span className="eyebrow">PAÍSES PARTICIPANTES</span>
        <h2 id="paises-titulo">Uma frente pela integração sul-americana</h2>
      </div>
      <ul className="countries-list">
        {rows.map((r) => {
          const src = flagSrc(r);
          const name = r.title || countryName[r.data.code] || r.data.code;
          return (
            <li key={r.id} className="country">
              <div className="country-flag">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={"Bandeira: " + name} loading="lazy" />
                ) : (
                  <span>{r.data.code}</span>
                )}
              </div>
              <strong>{name}</strong>
              {r.data.representative ? (
                <span className="country-rep">{r.data.representative}</span>
              ) : (
                <span className="country-rep muted">
                  Representante a definir
                </span>
              )}
              {r.data.role && <small>{r.data.role}</small>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
