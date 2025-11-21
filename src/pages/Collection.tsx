import React, { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { apiFetch } from "../lib/api";
import { API_USER } from "../lib/config";
import { panel } from "../components/Neon";
import { CollectionDTO, UserDTO } from "../types";

export default function CollectionPage() {
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

  return (
    <PageShell>
      <h2 className="text-2xl font-bold mb-4">Sua Coleção</h2>
      {loading && <div className="text-gray-300">Carregando...</div>}
      {error && <div className="text-red-400">{error}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(collection?.cards || []).map((c) => (
          <div key={c.id} className={`${panel} p-5`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg" style={{ color: "#E100FF" }}>
                {c.cardTemplateCode}
              </div>
              <div className="text-gray-300 text-sm">x{c.quantity}</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Código de carta</p>
          </div>
        ))}
      </div>

      {!loading && (collection?.cards?.length ?? 0) === 0 && (
        <div className={`${panel} p-6 text-gray-300 mt-4`}>
          Sua coleção está vazia. Crie cartas no catálogo e adicione na coleção.
        </div>
      )}
    </PageShell>
  );
}
