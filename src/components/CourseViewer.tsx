"use client";
import { VideoPlayer } from "./VideoPlayer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client-api";
import { safeUrl, type Resource } from "@/lib/catalog";
import * as tts from "@/services/tts";
export function CourseViewer({ id }: { id: string }) {
  const [course, setCourse] = useState<Resource | null>(null),
    [modules, setModules] = useState<Resource[]>([]),
    [lessons, setLessons] = useState<Resource[]>([]),
    [selected, setSelected] = useState<Resource | null>(null),
    [learning, setLearning] = useState<any>(null),
    [questions, setQuestions] = useState<any[]>([]),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [note, setNote] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const d = await api("/api/resources?id=" + id);
      setCourse(d.rows[0] || null);
      if (!d.rows.length) throw Error("Curso não disponível.");
      const all = async (kind: string) => {
        const out: Resource[] = [];
        for (let offset = 0; offset <= 10000; offset += 50) {
          const p = await api(
            "/api/resources?kind=" + kind + "&offset=" + offset,
          );
          out.push(...p.rows);
          if (p.rows.length < 50) break;
        }
        return out;
      };
      const ms = (await all("module")).filter((r) => r.parent_id === id);
      setModules(ms);
      setLessons(
        (await all("lesson")).filter((r) =>
          ms.some((m) => r.parent_id === m.id),
        ),
      );
      try {
        setLearning(await api("/api/learning"));
      } catch {
        setMessage(
          "Entre com cadastro aprovado para acessar lições, progresso e anotações.",
        );
      }
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  useEffect(() => {
    load();
    return () => tts.stopSpeech();
  }, [id]);
  useEffect(() => {
    setAnswers({});
    setQuestions([]);
    if (selected)
      api("/api/learning?lesson=" + selected.id)
        .then((d) => setQuestions(d.questions))
        .catch((e) => setMessage(e.message));
    tts.stopSpeech();
  }, [selected?.id]);
  async function action(action: string) {
    setBusy(true);
    try {
      const d = await api("/api/learning", {
        action,
        id: ["complete", "note"].includes(action) ? selected!.id : id,
        answers,
        text: note,
      });
      if (action === "certificate") {
        location.href = "/certificado/" + d.result;
        return;
      }
      setMessage(
        action === "complete"
          ? "Resultado: " +
              d.result +
              "%. " +
              (d.result >= 70
                ? "Lição concluída."
                : "Revise e tente novamente.")
          : action === "note"
            ? "Anotação salva."
            : "Matrícula registrada.",
      );
      if (action === "note") setNote("");
      setLearning(await api("/api/learning"));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const completed = new Set(
      learning?.progress.map((p: any) => p.lesson_id) || [],
    ),
    enrolled = learning?.enrollments.some((r: any) => r.course_id === id),
    done = lessons.filter((l) => completed.has(l.id)).length;
  return (
    <section className="wrap">
      <Link href="/academy">← Todos os cursos</Link>
      <h1>{course?.title || "PROSUL Academy"}</h1>
      {course && (
        <>
          <p>{course.summary}</p>
          <span className="tag">{course.data.hours} horas</span>
          <div className="actions">
            <button
              disabled={busy || enrolled}
              onClick={() => action("enroll")}
            >
              {enrolled ? "Matriculado" : "Matricular-me"}
            </button>
            <button
              className="secondary"
              disabled={
                busy || !enrolled || !lessons.length || done < lessons.length
              }
              onClick={() => action("certificate")}
            >
              Emitir certificado
            </button>
          </div>
          <p>
            {done} de {lessons.length} lições publicadas concluídas
          </p>
          <div className="progress">
            <span
              style={{
                width:
                  (lessons.length ? (done / lessons.length) * 100 : 0) + "%",
              }}
            />
          </div>
        </>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <div className="workspace" style={{ marginTop: 30 }}>
        <aside className="card">
          {modules.map((m) => (
            <div key={m.id}>
              <h3>{m.title}</h3>
              {lessons
                .filter((l) => l.parent_id === m.id)
                .map((l) => (
                  <button
                    className="secondary"
                    style={{
                      margin: "6px 0",
                      width: "100%",
                      textAlign: "left",
                    }}
                    key={l.id}
                    onClick={() => setSelected(l)}
                  >
                    {completed.has(l.id) ? "✓ " : ""}
                    {l.title}
                  </button>
                ))}
            </div>
          ))}
          {!modules.length && (
            <p className="muted">Nenhum módulo disponível para este acesso.</p>
          )}
        </aside>
        <article className="card">
          {selected ? (
            <>
              <small>LIÇÃO</small>
              <h2>{selected.title}</h2>
              <p>{selected.data.objective}</p>
              <div className="actions">
                <button
                  className="secondary"
                  onClick={() => tts.speakText(selected.body, {})}
                >
                  Ouvir texto
                </button>
                <button className="secondary" onClick={() => tts.stopSpeech()}>
                  Parar áudio
                </button>
                {safeUrl(selected.data.url || "") && (
                  <a
                    className="btn secondary"
                    href={selected.data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vídeo / material ↗
                  </a>
                )}
              </div>
              <VideoPlayer
                key={selected.id}
                url={selected.data.url || ""}
                title={selected.title}
              />
              <div className="prose">{selected.body}</div>
              <p>{selected.data.reflection}</p>
              {questions.map((q) => (
                <fieldset className="card" key={q.id}>
                  <legend>{q.prompt}</legend>
                  {q.options.map((o: string, i: number) => (
                    <label key={i}>
                      <input
                        type="radio"
                        style={{ width: "auto" }}
                        name={q.id}
                        checked={answers[q.id] === i}
                        onChange={() => setAnswers({ ...answers, [q.id]: i })}
                      />{" "}
                      {o}
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className="actions">
                <button
                  disabled={busy || !enrolled}
                  onClick={() => action("complete")}
                >
                  {questions.length
                    ? "Responder e concluir"
                    : "Marcar como concluída"}
                </button>
              </div>
              <label htmlFor="note">Anotação pessoal</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={10000}
              />
              <button
                disabled={busy || !note.trim() || !enrolled}
                onClick={() => action("note")}
              >
                Salvar anotação
              </button>
            </>
          ) : (
            <div className="prose">
              {course?.body || "Selecione uma lição."}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
