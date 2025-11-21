import React, { useEffect, useRef, useState } from "react";
import PageShell from "../components/PageShell";
import { apiFetch } from "../lib/api";
import { API_DUEL, WS_DUEL } from "../lib/config";
import { Input, NeonButton, panel } from "../components/Neon";
import { GameSession } from "../types";
import { useNavigate, useParams } from "react-router-dom";

export default function DuelPage() {
  const params = useParams();
  const nav = useNavigate();
  const duelId = params.id!;

  const [session, setSession] = useState<GameSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [wsMsg, setWsMsg] = useState("");
  const [wsLog, setWsLog] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // quick flow: /duel/quick starts a duel
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (duelId === "quick") {
          const created = await apiFetch<any>(`${API_DUEL}/duels/start?playerOneId=1&playerTwoId=2`, { method: "POST" });
          if (!mounted) return;
          nav(`/duel/${created.id}`, { replace: true });
          return;
        }
        const s = await apiFetch<GameSession>(`${API_DUEL}/duels/${duelId}`);
        if (!mounted) return;
        setSession(s);
      } catch (e: any) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [duelId]);

  // websocket live log
  useEffect(() => {
    const ws = new WebSocket(WS_DUEL);
    wsRef.current = ws;

    ws.onopen = () => setWsLog((l) => [...l, "[WS] conectado"]);
    ws.onmessage = (ev) => setWsLog((l) => [...l, ev.data]);
    ws.onerror = () => setWsLog((l) => [...l, "[WS] erro"]);

    return () => ws.close();
  }, []);

  async function playTurn(action: string) {
    setError(null);
    try {
      const updated = await apiFetch<GameSession>(`${API_DUEL}/duels/${duelId}/turn?action=${encodeURIComponent(action)}`, { method: "POST" });
      setSession(updated);
      wsRef.current?.send(`Turno jogado: ${action}`);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Duelo #{duelId}</h2>
        <NeonButton className="w-auto px-4" variant="ghost" onClick={() => nav("/dashboard")}>Voltar</NeonButton>
      </div>

      {loading && <div className="text-gray-300">Carregando...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {session && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className={`${panel} p-6 lg:col-span-2`}>
            <div className="text-gray-300 text-sm">Players: {session.playerOneId} vs {session.playerTwoId}</div>
            <div className="mt-2 text-xs text-gray-500">State JSON</div>
            <pre className="mt-2 text-sm bg-black/40 p-4 rounded-lg border border-white/5 overflow-auto max-h-80">
              {session.stateJson}
            </pre>

            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <NeonButton onClick={() => playTurn("Attack")} className="w-full">Atacar</NeonButton>
              <NeonButton variant="ghost" onClick={() => playTurn("Defend")} className="w-full">Defender</NeonButton>
              <NeonButton variant="ghost" onClick={() => playTurn("EndTurn")} className="w-full">Finalizar Turno</NeonButton>
            </div>
          </div>

          <div className={`${panel} p-6`}>
            <h3 className="font-semibold">WebSocket (tempo real)</h3>
            <div className="mt-3 space-y-2 max-h-64 overflow-auto text-sm text-gray-200">
              {wsLog.map((m, i) => (
                <div key={i} className="bg-white/5 p-2 rounded">{m}</div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input className="mt-0" placeholder="enviar msg" value={wsMsg} onChange={(e) => setWsMsg(e.target.value)} />
              <NeonButton
                className="w-auto px-4"
                onClick={() => {
                  wsRef.current?.send(wsMsg);
                  setWsMsg("");
                }}
              >
                Enviar
              </NeonButton>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
