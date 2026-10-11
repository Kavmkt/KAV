"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { composeSheet, dataUrlToJpeg, shrink } from "@/lib/image";

const MAX_PHOTOS = 4;

type Photo = { id: string; file: File; url: string };
type Quota = { used: number; max: number; remaining: number; demo?: boolean };
type View = "front" | "side" | "back";
type Result = { sheet: string; front: string; side: string; back: string };
const VIEW_LABEL: Record<View, string> = { front: "frente", side: "lateral", back: "traseira" };

const TIPS = [
  { i: "☀️", t: "Luz natural", d: "Prefira fotos bem iluminadas, sem sombras fortes no rosto." },
  { i: "🙂", t: "Rosto visível", d: "Sem óculos escuros, boné cobrindo ou filtros." },
  { i: "🧍", t: "Corpo inteiro", d: "Inclua ao menos 1 foto de corpo inteiro para a roupa." },
  { i: "🔄", t: "Vários ângulos", d: "Frente, perfil e costas (cabelo) ajudam a traseira ficar fiel." },
];

export default function Studio() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState("");
  const [quota, setQuota] = useState<Quota | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [phase, setPhase] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/quota").then((r) => r.json()).then(setQuota).catch(() => {});
  }, []);

  const addFiles = useCallback(async (list: FileList | File[]) => {
    setError("");
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return setError("Envie arquivos de imagem (JPG, PNG ou WebP).");
    try {
      const room = MAX_PHOTOS - photos.length;
      const small = await Promise.all(imgs.slice(0, room).map((f) => shrink(f)));
      setPhotos((p) => [
        ...p,
        ...small.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) })),
      ]);
      if (imgs.length > room) setError(`Máximo de ${MAX_PHOTOS} fotos.`);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [photos.length]);

  const remove = (id: string) =>
    setPhotos((p) => {
      const x = p.find((q) => q.id === id);
      if (x) URL.revokeObjectURL(x.url);
      return p.filter((q) => q.id !== id);
    });

  const exhausted = quota ? quota.remaining <= 0 : false;

  async function callView(view: View, front?: string, side?: string): Promise<string> {
    const fd = new FormData();
    fd.append("step", view);
    fd.append("notes", notes);
    photos.forEach((p) => fd.append("photos", p.file));
    if (front) fd.append("front", await dataUrlToJpeg(front, "front.jpg"));
    if (side) fd.append("side", await dataUrlToJpeg(side, "side.jpg"));
    const r = await fetch("/api/generate", { method: "POST", body: fd });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (typeof data.remaining === "number") setQuota((q) => (q ? { ...q, remaining: data.remaining } : q));
      throw new Error(data.error || "Algo deu errado. Tente novamente.");
    }
    if (view === "front") setQuota((q) => ({ ...(q as Quota), used: data.used, max: data.max, remaining: data.remaining }));
    return data.image as string;
  }

  async function generate() {
    if (!photos.length || busy || exhausted) return;
    setBusy(true);
    setError("");
    try {
      setPhase("Criando a frente do seu boneco… (1/3)");
      const front = await callView("front");
      setPhase("Girando o mesmo boneco para a lateral… (2/3)");
      const side = await callView("side", front);
      setPhase("Criando a traseira a partir da frente e da lateral… (3/3)");
      const back = await callView("back", front, side);
      setPhase("Montando as 3 vistas…");
      const sheet = await composeSheet([front, side, back]);
      const r: Result = { sheet, front, side, back };
      setResult(r);
      setHistory((h) => [r, ...h].slice(0, 15));
      setTimeout(() => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setPhase("");
    }
  }

  function save(src: string, name: string) {
    const a = document.createElement("a");
    a.href = src;
    a.download = name + (src.startsWith("data:image/svg") ? ".svg" : ".png");
    a.click();
  }

  function downloadAll(r: Result) {
    save(r.sheet, "meu-boneco-3-vistas");
    (["front", "side", "back"] as View[]).forEach((v, i) =>
      setTimeout(() => save(r[v], `meu-boneco-${VIEW_LABEL[v]}`), 300 * (i + 1)),
    );
  }

  const pct = quota ? (quota.remaining / quota.max) * 100 : 100;

  return (
    <div className="grid">
      <section className="card">
        <div className="card-head">
          <h2>1 · Suas fotos</h2>
          <span className="count">{photos.length}/{MAX_PHOTOS}</span>
        </div>

        <div className="tips">
          {TIPS.map((t) => (
            <div key={t.t} className="tip">
              <span>{t.i}</span>
              <div><b>{t.t}</b><small>{t.d}</small></div>
            </div>
          ))}
        </div>

        <div
          className={`drop ${drag ? "on" : ""}`}
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
          role="button" tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && input.current?.click()}
        >
          <div className="drop-ico">📸</div>
          <b>Toque ou arraste suas fotos aqui</b>
          <small>JPG, PNG ou WebP · até {MAX_PHOTOS} fotos</small>
          <input ref={input} type="file" accept="image/*" multiple hidden
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
        </div>

        {photos.length > 0 && (
          <div className="thumbs">
            {photos.map((p) => (
              <div key={p.id} className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="Foto de referência" />
                <button aria-label="Remover foto" onClick={() => remove(p.id)}>×</button>
              </div>
            ))}
          </div>
        )}

        <label className="notes">
          <span>2 · Detalhes extras <em>(opcional)</em></span>
          <textarea value={notes} maxLength={400} rows={3}
            placeholder="Ex.: segurando uma guitarra, camiseta azul, sem barba…"
            onChange={(e) => setNotes(e.target.value)} />
        </label>

        <div className="quota">
          <div className="quota-top">
            <span>Tentativas restantes</span>
            <b>{quota ? `${quota.remaining} de ${quota.max}` : "…"}</b>
          </div>
          <div className="bar"><i style={{ width: `${pct}%` }} /></div>
          {quota?.demo && <small className="demo">Modo demonstração: a IA real entra quando a chave da IA for configurada.</small>}
        </div>

        {error && <div className="error" role="alert">{error}</div>}

        <button className="cta" disabled={!photos.length || busy || exhausted} onClick={generate}>
          {busy ? <><span className="spin" /> Criando…</> : exhausted ? "Tentativas esgotadas" : result ? "✨ Gerar outra versão" : "✨ Criar meu boneco"}
        </button>
        {busy && <small className="wait">{phase}<br />Leva cerca de 1–2 minutos. Não feche a página.</small>}
      </section>

      <section className="card result" id="resultado">
        <div className="card-head">
          <h2>3 · Seu boneco</h2>
          {result && <button className="ghost" onClick={() => downloadAll(result)}>⬇ Baixar (folha + 3 vistas)</button>}
        </div>

        <div className={`stage ${busy ? "busy" : ""}`}>
          {result ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={result.sheet} alt="Boneco colecionável em três vistas: frente, lateral e traseira" />
          ) : (
            <div className="empty">
              <div className="views">
                <span>Frente</span><span>Lateral</span><span>Traseira</span>
              </div>
              <p>Seu boneco aparece aqui, nas três vistas.</p>
            </div>
          )}
          {busy && <div className="shimmer" />}
        </div>

        {history.length > 1 && (
          <div className="hist">
            <small>Suas versões nesta sessão</small>
            <div className="thumbs sm">
              {history.map((h, i) => (
                <button key={i} className={`thumb ${h === result ? "sel" : ""}`} onClick={() => setResult(h)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.sheet} alt={`Versão ${history.length - i}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
