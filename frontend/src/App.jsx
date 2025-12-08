import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import BuscaPacientes from "./pages/BuscaPacientes";
import BuscaConsultas from "./pages/BuscaConsultas";

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  useEffect(() => {
    setUsuarioLogado(!!localStorage.getItem('usuario_id'));
  }, []);

  return (
    <Routes>
      <Route path="/" element={!usuarioLogado ? <AuthPage /> : <Navigate to="/app" />} />
      
      <Route path="/app" element={usuarioLogado ? <Dashboard /> : <Navigate to="/" />} />
      
      <Route path="/pacientes" element={usuarioLogado ? <BuscaPacientes /> : <Navigate to="/" />} />

      <Route path="/consultas" element={usuarioLogado ? <BuscaConsultas /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;