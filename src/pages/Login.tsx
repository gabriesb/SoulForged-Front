import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_USER } from "../lib/config";
import { setToken } from "../lib/auth";
import { Input, NeonButton } from "../components/Neon";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_USER}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) throw new Error("Credenciais inválidas.");
      const data = await res.json();
      setToken(data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
      <div className="w-full max-w-md bg-[#11111A] p-10 rounded-xl shadow-2xl border border-[#2A0134]">
        <h1 className="text-4xl font-extrabold text-center mb-2 tracking-widest" style={{ color: "#E100FF" }}>
          SOULFORGED
        </h1>
        <p className="text-gray-300 text-center mb-8">Entre no seu reino sombrio</p>

        <form className="flex flex-col space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="text-gray-300 text-sm">Usuário</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Senha</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <NeonButton disabled={loading} type="submit" className="w-full">
            {loading ? "Entrando..." : "Entrar"}
          </NeonButton>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Ainda não possui conta?{" "}
          <span onClick={() => navigate("/register")} className="text-[#E100FF] cursor-pointer hover:underline">
            Registre-se
          </span>
        </p>
      </div>
    </div>
  );
}
