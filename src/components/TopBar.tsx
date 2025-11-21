import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken, isAuthed } from "../lib/auth";

export default function TopBar() {
  const nav = useNavigate();
  const authed = isAuthed();

  return (
    <div className="sticky top-0 z-20 backdrop-blur bg-black/40 border-b border-[#2A0134]">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E100FF] to-[#6a0dad]" />
          <div>
            <div className="text-lg font-extrabold tracking-widest" style={{ color: "#E100FF" }}>
              SOULFORGED
            </div>
            <div className="text-xs text-gray-400">Dark Fantasy TCG</div>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-sm">
          {authed ? (
            <>
              <Link className="px-3 py-2 rounded-md hover:bg-white/5" to="/collection">Coleção</Link>
              <Link className="px-3 py-2 rounded-md hover:bg-white/5" to="/catalog/cards">Cartas</Link>
              <Link className="px-3 py-2 rounded-md hover:bg-white/5" to="/catalog/decks">Decks</Link>
              <button
                className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10"
                onClick={() => {
                  clearToken();
                  nav("/login");
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link className="px-3 py-2 rounded-md hover:bg-white/5" to="/login">Login</Link>
              <Link className="px-3 py-2 rounded-md hover:bg-white/5" to="/register">Registro</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
