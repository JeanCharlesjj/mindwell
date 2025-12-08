import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const USUARIO_ID = localStorage.getItem('usuario_id'); 
    const USUARIO_TIPO = localStorage.getItem('usuario_tipo');
    const USUARIO_NOME = localStorage.getItem('usuario_nome');

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

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
    const titulo = isPsicologo ? "Minha Agenda (Profissional)" : "Minhas Sessões";
    const corDestaque = isPsicologo ? "var(--primary-color)" : "#10b981";

    return (
        <div className="app-container">
            <aside className="sidebar">
                <h2 style={{color: corDestaque}}>MindWell</h2>
                
                <div className="menu-item active" style={{color: corDestaque, backgroundColor: '#f0fdf4'}}>
                    {isPsicologo ? 'Dashboard' : 'Sessões'}
                </div>
                
                {isPsicologo && <div className="menu-item" onClick={() => navigate('/pacientes')}>Meus Pacientes</div>}
                
                <div className="menu-item" onClick={() => navigate('/consultas')}>Minhas Consultas</div>

                {!isPsicologo && <div className="menu-item">Buscar Psicólogo</div>}

                <div className="menu-item-logout" onClick={handleLogout}>🚪 Sair</div>
            </aside>

            <main className="main-content">
                <header className="header">
                    <h2>Olá, {USUARIO_NOME}</h2>
                    <h2>{titulo}</h2>
                </header>

                <section className="cards-grid">
                    <div className="card" style={{borderLeftColor: corDestaque}}>
                        <h3>{isPsicologo ? 'Consultas Agendadas' : 'Próxima Sessão'}</h3>
                        <div className="number" style={{color: corDestaque}}>{consultas.length}</div>
                    </div>
                </section>

                <h3 className="section-title">Histórico e Agendamentos</h3>
                
                <div className="lista-consultas">
                    {loading && <p>Carregando...</p>}
                    {!loading && consultas.length === 0 && <p>Nenhuma consulta encontrada.</p>}

                    {consultas.map(consulta => (
                        <div className="consulta-item" key={consulta.id}>
                            <div className="consulta-info">
                                <strong>
                                    {isPsicologo ? `Paciente: ${consulta.nomePaciente}` : `Dr(a): ${consulta.nomePsicologo}`}
                                </strong>
                                <span className="status-badge">{consulta.status}</span>
                            </div>
                            <div className="consulta-time">
                                <div className="consulta-date">
                                    {new Date(consulta.dataHora).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="consulta-hour" style={{color: corDestaque}}>
                                    {new Date(consulta.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;