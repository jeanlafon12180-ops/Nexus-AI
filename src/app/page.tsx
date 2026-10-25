"use client";

import { FormEvent, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ApiResponse = { message?: { content?: string }; model?: { id?: string; provider?: string }; error?: { message?: string }; messageText?: string };

const providers = [
  { id: "auto", label: "Automatique" },
  { id: "gpt", label: "GPT" },
  { id: "grok", label: "Grok" },
  { id: "gemini", label: "Gemini" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "mistral", label: "Mistral" },
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Bonjour ! Je suis Nexus IA. Choisis un modèle ou laisse la sélection sur Automatique, puis envoie ton message. Les requêtes passent par le serveur ; les clés API ne sont pas envoyées au navigateur." },
  ]);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("auto");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Prêt");
  const endRef = useRef<HTMLDivElement>(null);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = prompt.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setPrompt("");
    setBusy(true);
    setStatus("Connexion au modèle…");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-30), model }),
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok) throw new Error(data.error?.message || data.messageText || `Erreur serveur (${response.status})`);
      const answer = data.message?.content;
      if (!answer) throw new Error("Le serveur n’a pas renvoyé de réponse.");
      setMessages([...next, { role: "assistant", content: answer }]);
      setStatus(`Connecté · ${data.model?.provider || model} · ${data.model?.id || "modèle sélectionné"}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
      setMessages([...next, { role: "assistant", content: `Je n’ai pas pu obtenir de réponse : ${message}\n\nVérifie que le déploiement utilise la branche architecture/v1 et que les variables API sont configurées pour Preview.` }]);
      setStatus("Connexion à vérifier");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    }
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand-mark">N</div>
      <div className="brand-copy"><strong>Nexus IA</strong><span>Assistant multi-modèles</span></div>
      <div className={busy ? "status busy" : "status"}><span className="status-dot" />{status}</div>
    </header>
    <section className="conversation" aria-live="polite">
      {messages.map((message, index) => <article className={`message ${message.role}`} key={index}>
        {message.role === "assistant" && <div className="avatar">N</div>}
        <div className="bubble"><div className="message-label">{message.role === "assistant" ? "Nexus IA" : "Toi"}</div><p>{message.content}</p></div>
      </article>)}
      {busy && <div className="typing"><span /> <span /> <span /> Nexus IA réfléchit…</div>}
      <div ref={endRef} />
    </section>
    <form className="composer" onSubmit={send}>
      <label className="model-select"><span>Modèle</span><select value={model} onChange={event => setModel(event.target.value)} disabled={busy}>{providers.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <textarea value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Écris à Nexus IA…" rows={1} maxLength={8000} disabled={busy} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
      <button type="submit" disabled={busy || !prompt.trim()} aria-label="Envoyer">{busy ? "…" : "➤"}</button>
    </form>
    <footer>Les clés API restent côté serveur · Les fournisseurs peuvent appliquer leurs propres quotas et tarifs.</footer>
  </main>;
}
