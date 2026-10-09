"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client-api";
import {
  countries,
  kinds,
  kindKeys,
  parentKinds,
  privateKinds,
  type Field,
  type Kind,
  type Resource,
} from "@/lib/catalog";
const empty = (kind: Kind) => ({
  kind,
  title: "",
  summary: "",
  body: "",
  country: "",
  theme: "",
  parent_id: null,
  position: 0,
  data: {},
  status: "draft",
});
export function AdminPanel({ section }: { section: string }) {
  const [me, setMe] = useState<any>(null),
    [rows, setRows] = useState<any[]>([]),
    [parents, setParents] = useState<Resource[]>([]),
    [form, setForm] = useState<any>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [offset, setOffset] = useState(0),
    [query, setQuery] = useState(""),
    [totalParents, setTotalParents] = useState(false);
  const kind = kindKeys.includes(section as Kind) ? (section as Kind) : null;
  const accessible = (k: string) =>
    me?.profile?.role === "admin" ||
    (me?.profile?.role === "editor" &&
      ["Conteúdo", "Observatório"].includes((kinds as any)[k]?.group)) ||
    (me?.profile?.role === "academy" &&
      (kinds as any)[k]?.group === "Academy") ||
    (me?.profile?.role === "operations" &&
      (kinds as any)[k]?.group === "Gestão");
  async function load() {
    setBusy(true);
    try {
      if (section === "members")
        setRows((await api("/api/members?offset=" + offset)).rows);
      else if (kind)
        setRows(
          (
            await api(
              "/api/resources?admin=true&kind=" + kind + "&offset=" + offset,
            )
          ).rows,
        );
      else if (section === "audit")
        setRows((await api("/api/audit?offset=" + offset)).rows);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    api("/api/me")
      .then(setMe)
      .catch(() => setMessage("Entre com uma conta administrativa."));
  }, []);
  useEffect(() => {
    setForm(null);
    setMessage("");
    if (me?.staff) load();
  }, [section, offset, me?.staff]);
  useEffect(() => {
    if (!kind || !me?.staff || !parentKinds[kind]) {
      setParents([]);
      return;
    }
    let current = true;
    api("/api/resources?admin=true&kind=" + parentKinds[kind]![0])
      .then((d) => {
        if (current) {
          setParents(d.rows);
          setTotalParents(d.rows.length === 50);
        }
      })
      .catch((e) => setMessage(e.message));
    return () => {
      current = false;
    };
  }, [kind, me?.staff]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/resources", form);
      setForm(null);
      setMessage("Registro salvo.");
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function member(r: any) {
    setBusy(true);
    try {
      await api("/api/members", { id: r.id, status: r.status, role: r.role });
      setMessage("Acesso atualizado.");
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const change = (key: string, value: unknown) =>
    setForm((f: any) => ({ ...f, [key]: value }));
  return (
    <section className="wrap">
      <div className="section-heading">
        <div>
          <small>ADMINISTRAÇÃO PROSUL</small>
          <h1 style={{ fontSize: "2.4rem" }}>
            {kind
              ? kinds[kind].label
              : (
                  {
                    members: "Membros e acessos",
                    audit: "Auditoria",
                    collect: "Coleta legislativa",
                  } as any
                )[section] || "Visão geral"}
          </h1>
        </div>
        <Link href="/painel">Minha conta ↗</Link>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {!me?.staff ? (
        <div className="card">
          <h2>Acesso administrativo protegido</h2>
          <p>
            É necessária uma conta ativa com papel administrativo e autenticação
            em duas etapas.
          </p>
          <div className="actions">
            <Link className="btn" href="/entrar">
              Entrar
            </Link>
            <Link className="btn secondary" href="/seguranca">
              Configurar ou confirmar MFA
            </Link>
          </div>
        </div>
      ) : (
        <div className="workspace">
          <aside className="sidebar">
            <Link href="/admin">Visão geral</Link>
            {me.profile.role === "admin" && (
              <>
                <Link href="/admin/members">Membros e acessos</Link>
                <Link href="/admin/audit">Auditoria</Link>
              </>
            )}
            {["Conteúdo", "Academy", "Gestão", "Observatório"].map((g) => (
              <div key={g}>
                <h3>{g}</h3>
                {kindKeys
                  .filter((k) => kinds[k].group === g && accessible(k))
                  .map((k) => (
                    <Link
                      className={k === section ? "active" : ""}
                      key={k}
                      href={"/admin/" + k}
                    >
                      {kinds[k].label}
                    </Link>
                  ))}
              </div>
            ))}
            {accessible("legislative") && (
              <Link href="/admin/collect">Coleta Câmara e Senado</Link>
            )}
          </aside>
          <div>
            {section === "overview" && (
              <>
                <div className="card">
                  <h2>Um espaço para gerir a cooperação</h2>
                  <p>
                    Use os módulos ao lado para organizar conteúdos, formação,
                    instituições e recursos. Novos cadastros de membros aguardam
                    aprovação.
                  </p>
                  <p>
                    Os registros começam como rascunho. Salvar um novo rascunho
                    de item já publicado mantém sua última versão pública.
                    Arquivar retira o item do portal.
                  </p>
                </div>
                <div className="grid" style={{ marginTop: 20 }}>
                  {kindKeys.filter(accessible).map((k) => (
                    <Link className="card" key={k} href={"/admin/" + k}>
                      <h3>{kinds[k].label}</h3>
                      <small>{kinds[k].group} →</small>
                    </Link>
                  ))}
                </div>
              </>
            )}
            {section === "collect" && <Collector />}
            {kind && (
              <>
                <div className="actions">
                  <button onClick={() => setForm(empty(kind))}>
                    Novo registro
                  </button>
                  <input
                    style={{ maxWidth: 350 }}
                    placeholder="Filtrar os 50 registros desta página"
                    aria-label="Filtrar página"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                {form && (
                  <form className="card form" onSubmit={save}>
                    <h2>{form.id ? "Editar registro" : "Novo registro"}</h2>
                    <div>
                      <label htmlFor="title">Título</label>
                      <input
                        id="title"
                        required
                        minLength={3}
                        maxLength={250}
                        value={form.title}
                        onChange={(e) => change("title", e.target.value)}
                      />
                    </div>
                    <div className="split">
                      <div>
                        <label htmlFor="country">
                          País relacionado (não indica filiação)
                        </label>
                        <select
                          id="country"
                          value={form.country}
                          onChange={(e) => change("country", e.target.value)}
                        >
                          <option value="">Regional / não informado</option>
                          {countries.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="theme">Tema</label>
                        <input
                          id="theme"
                          value={form.theme}
                          maxLength={120}
                          onChange={(e) => change("theme", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="summary">Resumo</label>
                      <textarea
                        id="summary"
                        maxLength={1000}
                        value={form.summary}
                        onChange={(e) => change("summary", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="body">Conteúdo em texto</label>
                      <textarea
                        id="body"
                        value={form.body}
                        maxLength={100000}
                        onChange={(e) => change("body", e.target.value)}
                      />
                    </div>
                    {parentKinds[kind] && (
                      <div>
                        <label htmlFor="parent">
                          Vínculo: {kinds[parentKinds[kind]![0]].label}
                        </label>
                        <select
                          id="parent"
                          value={form.parent_id || ""}
                          onChange={(e) =>
                            change("parent_id", e.target.value || null)
                          }
                        >
                          <option value="">Selecione</option>
                          {parents.map((p) => (
                            <option value={p.id} key={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                        {totalParents && (
                          <p className="notice">
                            Lista parcial. Use a paginação de vínculos abaixo.
                          </p>
                        )}
                        <ParentSearch
                          kind={parentKinds[kind]![0]}
                          onRows={setParents}
                        />
                      </div>
                    )}
                    <div className="split">
                      {(kinds[kind].fields as Field[]).map((f) => (
                        <div className="field" key={f.key}>
                          <label htmlFor={"f-" + f.key}>{f.label}</label>
                          {f.options ? (
                            <select
                              id={"f-" + f.key}
                              required={f.required}
                              value={form.data[f.key] || ""}
                              onChange={(e) =>
                                change("data", {
                                  ...form.data,
                                  [f.key]: e.target.value,
                                })
                              }
                            >
                              <option value="">Selecione</option>
                              {f.options.map((o) => (
                                <option key={o}>{o}</option>
                              ))}
                            </select>
                          ) : f.type === "textarea" ? (
                            <textarea
                              id={"f-" + f.key}
                              required={f.required}
                              value={form.data[f.key] || ""}
                              onChange={(e) =>
                                change("data", {
                                  ...form.data,
                                  [f.key]: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <input
                              id={"f-" + f.key}
                              type={f.type || "text"}
                              required={f.required}
                              min={f.type === "number" ? 0 : undefined}
                              step={f.type === "number" ? "any" : undefined}
                              value={form.data[f.key] || ""}
                              onChange={(e) =>
                                change("data", {
                                  ...form.data,
                                  [f.key]: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="split">
                      <div>
                        <label htmlFor="position">Ordem</label>
                        <input
                          id="position"
                          type="number"
                          min={0}
                          value={form.position}
                          onChange={(e) =>
                            change("position", Number(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor="status">Estado editorial</label>
                        <select
                          id="status"
                          value={form.status}
                          onChange={(e) => change("status", e.target.value)}
                        >
                          <option value="draft">Rascunho</option>
                          <option value="review">Em revisão</option>
                          <option value="published">
                            {privateKinds.includes(kind)
                              ? "Ativar (permanece privado)"
                              : "Publicar"}
                          </option>
                          <option value="archived">Arquivar</option>
                        </select>
                      </div>
                    </div>
                    {privateKinds.includes(kind) && (
                      <p className="notice">
                        Módulo operacional privado. Estes registros não aparecem
                        no portal público.
                      </p>
                    )}
                    <div className="actions">
                      <button disabled={busy}>Salvar</button>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => setForm(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                    {kind === "lesson" &&
                      form.id &&
                      form.published === null && (
                        <QuestionEditor id={form.id} />
                      )}
                  </form>
                )}
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>País</th>
                        <th>Estado</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows
                        .filter((r) =>
                          r.title.toLowerCase().includes(query.toLowerCase()),
                        )
                        .map((r) => (
                          <tr key={r.id}>
                            <td>{r.title}</td>
                            <td>{r.country || "—"}</td>
                            <td>{r.status}</td>
                            <td>
                              <button
                                className="secondary"
                                onClick={() => {
                                  const {
                                    published,
                                    created_by,
                                    updated_at,
                                    ...editable
                                  } = r;
                                  setForm({ ...editable, published });
                                }}
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {section === "members" && (
              <>
                <p>
                  Cadastro de participante não equivale à condição de
                  parlamentar ou integrante formal da Frente.
                </p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Pessoa</th>
                        <th>Instituição</th>
                        <th>Status</th>
                        <th>Papel</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={r.id}>
                          <td>
                            {r.name}
                            <br />
                            <small>{r.email}</small>
                          </td>
                          <td>
                            {r.organization}
                            <br />
                            {r.country}
                          </td>
                          <td>
                            <select
                              aria-label={"Status de " + r.name}
                              value={r.status}
                              onChange={(e) =>
                                setRows(
                                  rows.map((x, n) =>
                                    n === i
                                      ? { ...x, status: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            >
                              {["pending", "active", "suspended"].map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              aria-label={"Papel de " + r.name}
                              value={r.role}
                              onChange={(e) =>
                                setRows(
                                  rows.map((x, n) =>
                                    n === i
                                      ? { ...x, role: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            >
                              {[
                                "member",
                                "editor",
                                "academy",
                                "operations",
                                "admin",
                              ].map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button disabled={busy} onClick={() => member(r)}>
                              Salvar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {section === "audit" && (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Ação</th>
                      <th>Responsável</th>
                      <th>Data</th>
                      <th>Recurso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.action}</td>
                        <td>{r.actor}</td>
                        <td>
                          {new Date(r.occurred_at).toLocaleString("pt-BR")}
                        </td>
                        <td>{r.resource_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {(kind || section === "members" || section === "audit") && (
              <>
                <div className="actions">
                  <button
                    className="secondary"
                    disabled={offset === 0 || busy}
                    onClick={() => setOffset(Math.max(0, offset - 50))}
                  >
                    Anterior
                  </button>
                  <button
                    className="secondary"
                    disabled={rows.length < 50 || busy}
                    onClick={() => setOffset(offset + 50)}
                  >
                    Próxima
                  </button>
                  <button className="secondary" onClick={load} disabled={busy}>
                    Atualizar
                  </button>
                </div>
                {!rows.length && !busy && (
                  <p className="empty">Nenhum registro disponível.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
function ParentSearch({
  kind,
  onRows,
}: {
  kind: Kind;
  onRows: (r: Resource[]) => void;
}) {
  const [page, setPage] = useState(0),
    [error, setError] = useState("");
  return (
    <>
      <button
        className="secondary"
        type="button"
        onClick={async () => {
          try {
            const next = page + 50;
            const d = await api(
              "/api/resources?admin=true&kind=" + kind + "&offset=" + next,
            );
            if (!d.rows.length) {
              setPage(0);
              onRows(
                (await api("/api/resources?admin=true&kind=" + kind)).rows,
              );
            } else {
              setPage(next);
              onRows(d.rows);
            }
          } catch {
            setError("Falha ao carregar vínculos.");
          }
        }}
      >
        Outros vínculos (paginados)
      </button>
      {error && <p>{error}</p>}
    </>
  );
}
function QuestionEditor({ id }: { id: string }) {
  const [prompt, setPrompt] = useState(""),
    [options, setOptions] = useState(""),
    [answer, setAnswer] = useState(0),
    [msg, setMsg] = useState("");
  return (
    <div className="card">
      <h3>Avaliação da lição</h3>
      <p>Cadastre antes da primeira publicação. Aprovação: 70% de acertos.</p>
      <label htmlFor="question">Enunciado</label>
      <input
        id="question"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <label htmlFor="options">Opções, uma por linha (2 a 6)</label>
      <textarea
        id="options"
        value={options}
        onChange={(e) => setOptions(e.target.value)}
      />
      <label htmlFor="correct">
        Número da resposta correta (começando em 1)
      </label>
      <input
        id="correct"
        type="number"
        min={1}
        max={6}
        value={answer + 1}
        onChange={(e) => setAnswer(Number(e.target.value) - 1)}
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await api("/api/learning", {
              action: "question",
              id,
              text: prompt,
              options: options.split("\n").filter(Boolean),
              answer,
            });
            setMsg("Questão adicionada.");
            setPrompt("");
            setOptions("");
          } catch (e) {
            setMsg((e as Error).message);
          }
        }}
      >
        Adicionar questão
      </button>
      <p role="status">{msg}</p>
    </div>
  );
}
function Collector() {
  const [source, setSource] = useState("camara"),
    [page, setPage] = useState(1),
    [term, setTerm] = useState("integração"),
    [message, setMessage] = useState(""),
    [rows, setRows] = useState<any[]>([]),
    [busy, setBusy] = useState(false);
  return (
    <section className="card form">
      <h2>Pesquisa temática de fontes oficiais</h2>
      <p>
        Importe para revisão. A coleta de uma página não representa cobertura
        completa. Não transforma propostas em incentivos vigentes.
      </p>
      <label htmlFor="provider">Fonte</label>
      <select
        id="provider"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      >
        <option value="camara">Câmara · proposições</option>
        <option value="senado">Senado · proposições</option>
        <option value="camara-news">Câmara · notícias RSS</option>
        <option value="senado-news">Senado · notícias RSS</option>
      </select>
      <label htmlFor="term">Termo</label>
      <input id="term" value={term} onChange={(e) => setTerm(e.target.value)} />
      <label htmlFor="source-page">Página de proposições da Câmara</label>
      <input
        id="source-page"
        type="number"
        min={1}
        max={100}
        disabled={source !== "camara"}
        value={page}
        onChange={(e) => setPage(Number(e.target.value))}
      />
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const d = await api("/api/observatory", { source, term, page });
            setRows(d.rows);
            setMessage(d.notice);
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Consultar fonte
      </button>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {rows.map((r, i) => (
        <article className="card" key={i}>
          <h3>{r.title}</h3>
          <p>{r.summary}</p>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api("/api/resources", {
                  ...empty("legislative"),
                  title: r.title,
                  summary: r.summary,
                  theme: term,
                  data: r.data,
                  status: "review",
                });
                setMessage(
                  "Registro enviado à revisão. Confira país, tema e situação antes de publicar.",
                );
              } catch (e) {
                setMessage((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Enviar para revisão
          </button>
        </article>
      ))}
    </section>
  );
}
