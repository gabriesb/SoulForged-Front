import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { apiFetch } from "../lib/api";
import { API_USER, API_DUEL } from "../lib/config";
import { NeonButton, panel } from "../components/Neon";
import { UserDTO, CollectionDTO } from "../types";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const [me, setMe] = useState<UserDTO | null>(null);
  const [collection, setCollection] = useState<CollectionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const meData = await apiFetch<UserDTO>(`${API_USER}/users/me`);
        if (!mounted) return;
        setMe(meData);
        const colData = await apiFetch<CollectionDTO>(`${API_USER}/users/${meData.id}/collection`);
        if (!mounted) return;
        setCollection(colData);
      } catch (e: any) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function quickDuel() {
    const created = await apiFetch<any>(`${API_DUEL}/duels/start?playerOneId=1&playerTwoId=2`, { method: "POST" });
    nav(`/duel/${created.id}`);
  }

  return (
    <PageShell>
      {loading && <div className="text-gray-300">Carregando...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {me && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`${panel} p-6 md:col-span-2`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Bem-vindo, {me.username}</h2>
                <p className="text-gray-400 text-sm">{me.email}</p>
              </div>
              <div className="text-xs text-gray-400">ID #{me.id}</div>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <NeonButton onClick={() => nav("/collection")} className="w-full">Ver coleção</NeonButton>
              <NeonButton variant="ghost" onClick={() => nav("/catalog/cards")} className="w-full">Catálogo</NeonButton>
              <NeonButton variant="ghost" onClick={() => nav("/catalog/decks")} className="w-full">Decks</NeonButton>
            </div>
          </div>

          <div className={`${panel} p-6`}>
            <h3 className="text-lg font-semibold">Resumo da Coleção</h3>
            <div className="mt-3 text-gray-300">
              <div>Tipos de cartas: {collection?.cards?.length ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Cartas únicas (por código)</div>
            </div>

            <div className="mt-4">
              <NeonButton onClick={quickDuel} className="w-full">Buscar duelo</NeonButton>
              <p className="text-xs text-gray-500 mt-2">Fluxo rápido: inicia duelo dummy</p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
