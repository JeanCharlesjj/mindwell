import { useState, useEffect } from 'react';
import api from '../services/api';

function Dashboard() {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const PSICOLOGO_ID = localStorage.getItem('usuario_id');

    const handleLogout = () => {
        // 1. Limpa a memória do navegador
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('usuario_tipo');
        
        // 2. Recarrega a página para voltar ao Login
        window.location.reload();
    };

    useEffect(() => {
        if (!PSICOLOGO_ID) {
             window.location.href = "/";
             return;
        }

        api.get(`/consultas?psicologoId=${PSICOLOGO_ID}`)
            .then(response => {
                setConsultas(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar dados:", error);
                setErro("Não foi possível carregar a agenda.");
                setLoading(false);
            });
    }, []);

    return (
        <div className="app-container">
            <aside className="sidebar">
                <h2>MindWell 🧠</h2>
                <div className="menu-item active">📅 Minha Agenda</div>
                <div className="menu-item">👥 Pacientes</div>
                
                <div 
                    className="menu-item" 
                    style={{ marginTop: 'auto', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={handleLogout}
                >
                    🚪 Sair
                </div>
            </aside>

            <main className="main-content">
                <header className="header">
                    <h2>Minha Agenda</h2>
                    {/* Você pode colocar o nome do usuário aqui depois */}
                </header>

                <section className="cards-grid">
                    <div className="card">
                        <h3>Total Agendado</h3>
                        <div className="number">{consultas.length}</div>
                    </div>
                </section>

                <h3 className="section-title">Próximas Sessões</h3>
                
                <div className="lista-consultas">
                    {loading && <p style={{color: '#666'}}>Carregando sua agenda...</p>}
                    {erro && <p style={{ color: '#ef4444' }}>{erro}</p>}
                    
                    {!loading && !erro && consultas.length === 0 && (
                        <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
                            <p style={{color: '#9ca3af'}}>Nenhuma consulta agendada para hoje.</p>
                        </div>
                    )}

                    {consultas.map(consulta => (
                        <div className="consulta-item" key={consulta.id}>
                            <div className="consulta-info">
                                <strong>{consulta.nomePaciente}</strong>
                                {/* Badge bonitinho para o status */}
                                <span className="status-badge">{consulta.status}</span>
                            </div>
                            
                            <div className="consulta-time">
                                <div className="consulta-date">
                                    {new Date(consulta.dataHora).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="consulta-hour">
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