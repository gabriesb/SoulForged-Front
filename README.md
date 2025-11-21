# Soulforged Frontend (React + Vite)

Frontend dark/neon para consumir a API Soulforged (3 microsserviços).  
Tema visual compatível com a apresentação: fundo preto/roxo e neon roxo/pink.

## Requisitos
- Node 18+

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

## URLs necessárias (.env)
- VITE_API_USER=http://localhost:8081
- VITE_API_CATALOG=http://localhost:8082
- VITE_API_DUEL=http://localhost:8083
- VITE_WS_DUEL=ws://localhost:8083/ws/duel

## Rotas
- /login
- /register
- /dashboard
- /collection
- /catalog/cards
- /catalog/decks
- /duel/:id (use /duel/quick para criar rápido)

## Observação sobre CORS
Se o browser bloquear, libere CORS no Spring Boot para `http://localhost:5173`.
