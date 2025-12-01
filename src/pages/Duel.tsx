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

  // fluxo rápido: /duel/quick cria o duelo e redireciona
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (duelId === "quick") {
          const created = await apiFetch<any>(
            `${API_DUEL}/duels/start?playerOneId=1&playerTwoId=2`,
            { method: "POST" }
          );
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

    return () => {
      mounted = false;
    };
  }, [duelId, nav]);

  // websocket para log em tempo real
  useEffect(() => {
    const ws = new WebSocket(WS_DUEL);
    wsRef.current = ws;

    ws.onopen = () =>
      setWsLog((l) => [...l, "[WS] Conectado ao servidor de duelo"]);
    ws.onmessage = (ev) =>
      setWsLog((l) => [...l, ev.data || "[WS] mensagem vazia"]);
    ws.onerror = () => setWsLog((l) => [...l, "[WS] Erro na conexão"]);
    ws.onclose = () => setWsLog((l) => [...l, "[WS] Conexão encerrada"]);

    return () => ws.close();
  }, []);

  async function playTurn(action: string) {
    setError(null);
    try {
      const updated = await apiFetch<GameSession>(
        `${API_DUEL}/duels/${duelId}/turn?action=${encodeURIComponent(
          action
        )}`,
        { method: "POST" }
      );
      setSession(updated);
      wsRef.current?.send(`Turno jogado: ${action}`);
    } catch (e: any) {
      setError(e.message);
    }
  }

  // tenta transformar o stateJson em objeto para exibir algo mais amigável
  let parsedState: any | null = null;
  if (session?.stateJson) {
    try {
      parsedState = JSON.parse(session.stateJson);
    } catch {
      parsedState = null;
    }
  }

  const turnInfo =
    parsedState?.turn ??
    parsedState?.currentTurn ??
    parsedState?.round ??
    undefined;

  const playerOne = parsedState?.players?.[0] ?? parsedState?.playerOne ?? null;
  const playerTwo = parsedState?.players?.[1] ?? parsedState?.playerTwo ?? null;

  return (
    <PageShell>
      {/* topo */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">
            Duelo <span className="text-pink-400">#{duelId}</span>
          </h2>
          {turnInfo !== undefined && (
            <p className="text-xs text-gray-400 mt-1">
              Turno atual: <span className="text-pink-300">{String(turnInfo)}</span>
            </p>
          )}
        </div>
        <NeonButton
          className="w-auto px-4"
          variant="ghost"
          onClick={() => nav("/dashboard")}
        >
          Voltar
        </NeonButton>
      </div>

      {loading && <div className="text-gray-300">Carregando...</div>}
      {error && <div className="text-red-400 mb-3">{error}</div>}

      {session && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* COLUNA PRINCIPAL: campo de batalha */}
          <div className={`${panel} p-6 lg:col-span-2 flex flex-col gap-4`}>
            {/* players */}
            <div className="grid sm:grid-cols-2 gap-4">
              <PlayerCard
                label="Jogador 1"
                id={session.playerOneId}
                data={playerOne}
                highlight
              />
              <PlayerCard
                label="Jogador 2"
                id={session.playerTwoId}
                data={playerTwo}
              />
            </div>

            {/* arena */}
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">Campo de batalha</div>
              <div className="relative border border-white/10 rounded-xl bg-gradient-to-b from-purple-900/40 via-black to-black/80 p-4 min-h-[220px] flex flex-col justify-between">
                {/* topo: lado do player 2 */}
                <BattleSide
                  alignment="top"
                  name={playerTwo?.name ?? `Player ${session.playerTwoId}`}
                  units={playerTwo?.board ?? playerTwo?.field}
                />

                {/* linha central */}
                <div className="h-px bg-white/10 my-3" />

                {/* baixo: lado do player 1 */}
                <BattleSide
                  alignment="bottom"
                  name={playerOne?.name ?? `Player ${session.playerOneId}`}
                  units={playerOne?.board ?? playerOne?.field}
                  isYou
                />

                {/* fallback quando não existe estrutura de board */}
                {!playerOne?.board &&
                  !playerTwo?.board &&
                  !playerOne?.field &&
                  !playerTwo?.field && (
                    <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                      Estrutura detalhada do tabuleiro ainda não mapeada.
                      Usando stateJson para depuração ao lado.
                    </p>
                  )}
              </div>
            </div>

            {/* ações do turno */}
            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-2">
                Ações disponíveis
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <NeonButton
                  onClick={() => playTurn("Attack")}
                  className="w-full"
                >
                  Atacar
                </NeonButton>
                <NeonButton
                  variant="ghost"
                  onClick={() => playTurn("Defend")}
                  className="w-full"
                >
                  Defender
                </NeonButton>
                <NeonButton
                  variant="ghost"
                  onClick={() => playTurn("EndTurn")}
                  className="w-full"
                >
                  Finalizar turno
                </NeonButton>
              </div>
            </div>
          </div>

          {/* COLUNA LATERAL: log + JSON */}
          <div className="space-y-4">
            {/* websocket log */}
            <div className={`${panel} p-6`}>
              <h3 className="font-semibold text-sm text-gray-100">
                Log em tempo real (WebSocket)
              </h3>
              <div className="mt-3 space-y-2 max-h-56 overflow-auto text-sm text-gray-200">
                {wsLog.length === 0 && (
                  <div className="text-xs text-gray-400 italic">
                    Nenhuma mensagem recebida ainda.
                  </div>
                )}
                {wsLog.map((m, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 p-2 rounded"
                  >
                    {m}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Input
                  className="mt-0"
                  placeholder="Enviar mensagem manual..."
                  value={wsMsg}
                  onChange={(e) => setWsMsg(e.target.value)}
                />
                <NeonButton
                  className="w-auto px-4"
                  onClick={() => {
                    if (!wsMsg.trim()) return;
                    wsRef.current?.send(wsMsg);
                    setWsMsg("");
                  }}
                >
                  Enviar
                </NeonButton>
              </div>
            </div>

            {/* JSON bruto de estado (debug) */}
            <div className={`${panel} p-6`}>
              <h3 className="font-semibold text-sm text-gray-100">
                Estado do jogo (JSON)
              </h3>
              <p className="mt-1 text-[11px] text-gray-400">
                Visão crua enviada pelo backend. Útil para depuração enquanto a
                interface do tabuleiro está sendo refinada.
              </p>
              <pre className="mt-2 text-xs bg-black/40 p-3 rounded-lg border border-white/5 overflow-auto max-h-64">
                {session.stateJson}
              </pre>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

/* ========== COMPONENTES AUXILIARES ========== */

interface PlayerCardProps {
  label: string;
  id: number | string;
  data: any;
  highlight?: boolean;
}

function PlayerCard({ label, id, data, highlight }: PlayerCardProps) {
  const life =
    data?.life ?? data?.hp ?? data?.health ?? undefined;
  const mana =
    data?.mana ?? data?.energy ?? undefined;

  return (
    <div
      className={`rounded-xl border p-4 bg-black/50 ${
        highlight
          ? "border-pink-500/70 shadow-[0_0_12px_rgba(236,72,153,0.5)]"
          : "border-white/10"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-widest text-gray-400">
          {label}
        </span>
        <span className="text-[11px] text-gray-400">ID #{id}</span>
      </div>
      <p className="text-lg font-semibold text-gray-100">
        {data?.name ?? `Player ${id}`}
      </p>

      <div className="mt-2 flex gap-4 text-xs text-gray-200">
        {life !== undefined && (
          <span className="flex items-center gap-1">
            ❤️ <span className="font-semibold">{life}</span>
          </span>
        )}
        {mana !== undefined && (
          <span className="flex items-center gap-1">
            💧 <span className="font-semibold">{mana}</span>
          </span>
        )}
        {Array.isArray(data?.hand) && (
          <span className="flex items-center gap-1">
            ✋ <span className="font-semibold">{data.hand.length}</span> na mão
          </span>
        )}
        {Array.isArray(data?.board ?? data?.field) && (
          <span className="flex items-center gap-1">
            🧱{" "}
            <span className="font-semibold">
              {(data.board ?? data.field).length}
            </span>{" "}
            em campo
          </span>
        )}
      </div>
    </div>
  );
}

interface BattleSideProps {
  alignment: "top" | "bottom";
  name: string;
  units?: any[]; // array de cartas/unidades, se existir
  isYou?: boolean;
}

function BattleSide({ alignment, name, units, isYou }: BattleSideProps) {
  const hasUnits = Array.isArray(units) && units.length > 0;

  return (
    <div
      className={`flex flex-col ${
        alignment === "top" ? "items-start" : "items-end"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">
          {isYou ? "Seu lado" : "Lado do oponente"}
        </span>
        <span className="text-xs text-gray-200 font-semibold">{name}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {hasUnits ? (
          units!.map((u, i) => (
            <div
              key={u?.id ?? i}
              className="w-20 h-28 rounded-lg border border-white/15 bg-black/70 flex flex-col justify-between p-2 text-[10px]"
            >
              <div className="font-semibold text-pink-300 truncate">
                {u?.name ?? "Unidade"}
              </div>
              <div className="text-gray-200 space-y-1">
                {u?.attack !== undefined && (
                  <div>ATK: {u.attack}</div>
                )}
                {u?.defense !== undefined && (
                  <div>DEF: {u.defense}</div>
                )}
                {u?.cost !== undefined && (
                  <div className="text-[9px] text-gray-300">
                    Custo: {u.cost}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <span className="text-[11px] text-gray-500 italic">
            Nenhuma unidade em campo
          </span>
        )}
      </div>
    </div>
  );
}
