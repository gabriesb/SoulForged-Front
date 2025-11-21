import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_USER } from "../lib/config";
import { Input, NeonButton } from "../components/Neon";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_USER}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      if (!res.ok) throw new Error("Falha ao registrar. Verifique os dados.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
      <div className="w-full max-w-md bg-[#11111A] p-10 rounded-xl shadow-2xl border border-[#2A0134]">
        <h1 className="text-3xl font-extrabold text-center mb-6 tracking-widest" style={{ color: "#E100FF" }}>
          REGISTRO
        </h1>

        <form className="flex flex-col space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="text-gray-300 text-sm">Usuário</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Senha</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <NeonButton disabled={loading} type="submit" className="w-full">
            {loading ? "Criando..." : "Criar conta"}
          </NeonButton>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Já possui conta?{" "}
          <span onClick={() => navigate("/login")} className="text-[#E100FF] cursor-pointer hover:underline">
            Entrar
          </span>
        </p>
      </div>
    </div>
  );
}
