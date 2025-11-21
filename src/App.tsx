import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CollectionPage from "./pages/Collection";
import CardsPage from "./pages/Cards";
import DecksPage from "./pages/Decks";
import DuelPage from "./pages/Duel";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/collection" element={<ProtectedRoute><CollectionPage /></ProtectedRoute>} />
        <Route path="/catalog/cards" element={<ProtectedRoute><CardsPage /></ProtectedRoute>} />
        <Route path="/catalog/decks" element={<ProtectedRoute><DecksPage /></ProtectedRoute>} />
        <Route path="/duel/:id" element={<ProtectedRoute><DuelPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
