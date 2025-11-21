import React from "react";
import PageShell from "../components/PageShell";
import { NeonButton, panel } from "../components/Neon";
import { Link } from "react-router-dom";

export default function NotFound(){
  return (
    <PageShell>
      <div className={`${panel} p-10 text-center`}>
        <h2 className="text-2xl font-bold">404</h2>
        <p className="text-gray-400 mt-2">Página não encontrada.</p>
        <div className="max-w-xs mx-auto mt-4">
          <Link to="/dashboard"><NeonButton className="w-full">Voltar ao início</NeonButton></Link>
        </div>
      </div>
    </PageShell>
  );
}
