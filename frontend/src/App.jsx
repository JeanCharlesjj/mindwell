import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('usuario_id');
    setUsuarioLogado(id);
  }, []);

  return (
    <div className="App">
      {usuarioLogado ? <Dashboard /> : <AuthPage />}
    </div>
  );
}

export default App;