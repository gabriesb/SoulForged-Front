import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { apiFetch } from "../lib/api";
import { API_CATALOG } from "../lib/config";
import { Input, NeonButton, bg, panel } from "../components/Neon";
import { CardTemplate } from "../types";

export default function CardsPage() {
  const [cards, setCards] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "HERO",
    rarity: "COMMON",
    manaCost: 1,
    attack: 0,
    health: 0,
  });

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const list = await apiFetch<CardTemplate[]>(`${API_CATALOG}/cards`);
      setCards(list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  async function createCard(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch(`${API_CATALOG}/cards`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          manaCost: Number(form.manaCost),
          attack: Number(form.attack),
          health: Number(form.health),
        }),
      });
      setForm({ code: "", name: "", description: "", type: "HERO", rarity: "COMMON", manaCost: 1, attack: 0, health: 0 });
      reload();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <PageShell>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`${panel} p-6 lg:w-1/3 h-fit`}>
          <h2 className="text-xl font-bold mb-4">Criar Carta</h2>
          <form className="space-y-3" onSubmit={createCard}>
            <div>
              <label className="text-sm text-gray-300">Código</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
            </div>
            <div>
              <label className="text-sm text-gray-300">Nome</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm text-gray-300">Descrição</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-300">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`w-full mt-1 p-3 ${bg} border border-[#6a0dad] text-white rounded-md`}>
                  <option>HERO</option>
                  <option>SPELL</option>
                  <option>ARTIFACT</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">Raridade</label>
                <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} className={`w-full mt-1 p-3 ${bg} border border-[#6a0dad] text-white rounded-md`}>
                  <option>COMMON</option>
                  <option>RARE</option>
                  <option>EPIC</option>
                  <option>LEGENDARY</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm text-gray-300">Mana</label>
                <Input type="number" min={0} value={form.manaCost} onChange={(e) => setForm({ ...form, manaCost: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm text-gray-300">Atk</label>
                <Input type="number" min={0} value={form.attack} onChange={(e) => setForm({ ...form, attack: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm text-gray-300">HP</label>
                <Input type="number" min={0} value={form.health} onChange={(e) => setForm({ ...form, health: Number(e.target.value) })} />
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}
            <NeonButton type="submit" className="w-full">Salvar</NeonButton>
          </form>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">Catálogo</h2>
            <NeonButton className="w-auto px-4" variant="ghost" onClick={reload}>Atualizar</NeonButton>
          </div>

          {loading && <div className="text-gray-300">Carregando...</div>}
          {error && <div className="text-red-400">{error}</div>}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div key={c.id} className={`${panel} p-5 relative overflow-hidden`}>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E100FF]/10 blur-2xl rounded-full" />
                <div className="font-semibold text-lg" style={{ color: "#E100FF" }}>{c.name}</div>
                <div className="text-xs text-gray-400">{c.code} • {c.type} • {c.rarity}</div>
                <p className="text-sm text-gray-200 mt-2 line-clamp-3">{c.description}</p>
                <div className="mt-3 flex gap-3 text-sm text-gray-300">
                  <span>Mana {c.manaCost}</span>
                  <span>Atk {c.attack}</span>
                  <span>HP {c.health}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
