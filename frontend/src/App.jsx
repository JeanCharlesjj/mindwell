import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import BuscaPacientes from "./pages/BuscaPacientes";
import BuscaConsultas from "./pages/BuscaConsultas";
import SalaAtendimento from './pages/SalaAtendimento';
import PerfilPsicologo from './pages/PerfilPsicologo';

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

      <Route path="/atendimento/:id" element={<SalaAtendimento />} />

      <Route path="/perfilPsicologo" element={<PerfilPsicologo />} />
    </Routes>
  );
}

export default App;