import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function Dashboard() {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const USUARIO_ID = localStorage.getItem('usuario_id'); 
    const USUARIO_TIPO = localStorage.getItem('usuario_tipo');
    const USUARIO_NOME = localStorage.getItem('usuario_nome');

    useEffect(() => {
        if (!USUARIO_ID) { window.location.href = "/"; return; }

        const url = USUARIO_TIPO === 'psicologo' 
            ? `/consultas?psicologoId=${USUARIO_ID}`
            : `/consultas?pacienteId=${USUARIO_ID}`;

        api.get(url)
            .then(res => {
                setConsultas(res.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    const isPsicologo = USUARIO_TIPO === 'psicologo';
    
    // Contagem apenas de consultas ATIVAS (não canceladas) para o card
    const agendamentosAtivos = consultas.filter(c => c.status !== 'CANCELADA').length;
    
    const tituloCard = isPsicologo ? 'Consultas Agendadas' : 'Próxima Sessão';
    const corDestaque = isPsicologo ? "var(--primary-color)" : "#10b981";

    return (
        <div className="app-container">
            <Sidebar />

            <main className="main-content">
                <header className="header">
                    <h2>Olá, {USUARIO_NOME} 👋</h2>
                </header>

                <section className="cards-grid">
                    <div className="card" style={{borderLeftColor: corDestaque}}>
                        <h3>{tituloCard}</h3>
                        <div className="number" style={{color: corDestaque}}>
                            {agendamentosAtivos}
                        </div>
                        <small style={{color: '#666'}}>Ativas</small>
                    </div>
                </section>

                <h3 className="section-title">Histórico e Agendamentos</h3>
                
                <div className="lista-consultas">
                    {loading && <p>Carregando...</p>}
                    {!loading && consultas.length === 0 && <p>Nenhuma consulta encontrada.</p>}

                    {consultas.map(consulta => {
                        const isCancelada = consulta.status === 'CANCELADA';
                        
                        return (
                            <div 
                                className="consulta-item" 
                                key={consulta.id}
                                style={{
                                    // Visual Cinza/Opaco se cancelada
                                    opacity: isCancelada ? 0.6 : 1,
                                    backgroundColor: isCancelada ? '#f3f4f6' : 'white',
                                    borderLeftColor: isCancelada ? '#9ca3af' : corDestaque
                                }}
                            >
                                <div className="consulta-info">
                                    <strong style={{textDecoration: isCancelada ? 'line-through' : 'none'}}>
                                        {isPsicologo ? `Paciente: ${consulta.nomePaciente}` : `Dr(a): ${consulta.nomePsicologo}`}
                                    </strong>
                                    
                                    <span 
                                        className="status-badge"
                                        style={{
                                            backgroundColor: isCancelada ? '#9ca3af' : undefined,
                                            color: isCancelada ? 'white' : undefined
                                        }}
                                    >
                                        {consulta.status}
                                    </span>
                                </div>

                                <div className="consulta-time">
                                    <div className="consulta-date">
                                        {new Date(consulta.dataHora).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div 
                                        className="consulta-hour" 
                                        style={{
                                            color: isCancelada ? '#666' : corDestaque,
                                            fontWeight: isCancelada ? 'normal' : 'bold'
                                        }}
                                    >
                                        {new Date(consulta.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;