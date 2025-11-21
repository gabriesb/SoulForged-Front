import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { apiFetch } from "../lib/api";
import { API_CATALOG } from "../lib/config";
import { Input, NeonButton, panel } from "../components/Neon";
import { CardTemplate, Deck } from "../types";

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<CardTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [ownerUserId, setOwnerUserId] = useState(1);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const [d, c] = await Promise.all([
        apiFetch<Deck[]>(`${API_CATALOG}/decks`),
        apiFetch<CardTemplate[]>(`${API_CATALOG}/cards`),
      ]);
      setDecks(d);
      setCards(c);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  function toggleCard(code: string) {
    setSelected((prev) => {
      const next = { ...prev };
      if (!next[code]) next[code] = 1;
      else delete next[code];
      return next;
    });
  }

  async function createDeck(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ownerUserId: Number(ownerUserId),
        name,
        cards: Object.entries(selected).map(([cardTemplateCode, quantity]) => ({
          cardTemplateCode,
          quantity,
        })),
      };
      await apiFetch(`${API_CATALOG}/decks`, { method: "POST", body: JSON.stringify(payload) });
      setName("");
      setSelected({});
      reload();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <PageShell>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`${panel} p-6 lg:col-span-1 h-fit`}>
          <h2 className="text-xl font-bold mb-4">Criar Deck</h2>
          <form className="space-y-3" onSubmit={createDeck}>
            <div>
              <label className="text-sm text-gray-300">Owner UserId</label>
              <Input type="number" min={1} value={ownerUserId} onChange={(e) => setOwnerUserId(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-gray-300">Nome do deck</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="text-sm text-gray-300">Selecione cartas</label>
              <div className="max-h-64 overflow-auto mt-2 space-y-2 pr-1">
                {cards.map((c) => (
                  <label key={c.id} className="flex items-center justify-between gap-2 bg-white/5 px-3 py-2 rounded-md border border-white/5 hover:border-[#6a0dad] cursor-pointer">
                    <div className="text-sm">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.code}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!selected[c.code]}
                      onChange={() => toggleCard(c.code)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}
            <NeonButton type="submit" className="w-full">Salvar Deck</NeonButton>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">Decks</h2>
            <NeonButton className="w-auto px-4" variant="ghost" onClick={reload}>Atualizar</NeonButton>
          </div>

          {loading && <div className="text-gray-300">Carregando...</div>}
          {error && <div className="text-red-400">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            {decks.map((d) => (
              <div key={d.id} className={`${panel} p-5`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg" style={{ color: "#E100FF" }}>{d.name}</div>
                  <div className="text-xs text-gray-400">Owner #{d.ownerUserId}</div>
                </div>

                <div className="mt-3 space-y-1">
                  {(d.cards || []).map((dc) => (
                    <div key={dc.id} className="text-sm text-gray-200 flex justify-between">
                      <span>{dc.cardTemplate?.code ?? "CARD"}</span>
                      <span>x{dc.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
