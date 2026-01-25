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
    
    // Contagem apenas de consultas AGENDADAS para o card
    const agendamentosAtivos = consultas.filter(c => c.status === 'AGENDADA').length;
    
    const tituloCard = isPsicologo ? 'Consultas Pendentes' : 'Próximas Sessões';
    const corDestaque = isPsicologo ? "var(--primary-color)" : "#10b981";

    return (
        <div className="app-container">
            <Sidebar />

            <main className="main-content">
                <header className="header">
                    <h2>Olá, {USUARIO_NOME}</h2>
                </header>

                <section className="cards-grid">
                    <div className="card" style={{borderLeftColor: corDestaque}}>
                        <h3>{tituloCard}</h3>
                        <div className="number" style={{color: corDestaque}}>
                            {agendamentosAtivos}
                        </div>
                        <small style={{color: '#666'}}>Agendadas</small>
                    </div>
                </section>

                <h3 className="section-title">Histórico e Agendamentos</h3>
                
                <div className="lista-consultas">
                    {loading && <p>Carregando...</p>}
                    {!loading && consultas.length === 0 && <p>Nenhuma consulta encontrada.</p>}

                    {consultas.map(consulta => {
                        const isCancelada = consulta.status === 'CANCELADA';
                        const isRealizada = consulta.status === 'REALIZADA';
                        
                        // Definição de Cores Baseada no Status
                        let corBorda = corDestaque;
                        let corFundo = 'white';
                        let opacidade = 1;
                        let corStatus = '#3b82f6'; // Azul padrão

                        if (isCancelada) {
                            corBorda = '#9ca3af'; // Cinza
                            corFundo = '#f3f4f6';
                            opacidade = 0.6;
                            corStatus = '#9ca3af';
                        } else if (isRealizada) {
                            corBorda = '#10b981'; // Verde Sucesso
                            corFundo = '#ecfdf5'; // Verde bem clarinho
                            corStatus = '#10b981';
                        } else {
                            // Agendada
                            corStatus = '#f59e0b'; // Laranja/Amarelo para pendente
                        }
                        
                        return (
                            <div 
                                className="consulta-item" 
                                key={consulta.id}
                                style={{
                                    opacity: opacidade,
                                    backgroundColor: corFundo,
                                    borderLeftColor: corBorda
                                }}
                            >
                                <div className="consulta-info">
                                    <strong style={{textDecoration: isCancelada ? 'line-through' : 'none'}}>
                                        {isPsicologo ? `Paciente: ${consulta.nomePaciente}` : `Dr(a): ${consulta.nomePsicologo}`}
                                    </strong>
                                    
                                    <span 
                                        className="status-badge"
                                        style={{
                                            backgroundColor: corStatus,
                                            color: 'white'
                                        }}
                                    >
                                        {isRealizada ? '✓ CONCLUÍDA' : consulta.status}
                                    </span>
                                </div>

                                <div className="consulta-time">
                                    <div className="consulta-date">
                                        {new Date(consulta.dataHora).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div 
                                        className="consulta-hour" 
                                        style={{
                                            color: isCancelada ? '#666' : corBorda,
                                            fontWeight: isCancelada ? 'normal' : 'bold'
                                        }}
                                    >
                                        {new Date(consulta.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    
                                    {/* BOTÃO SÓ APARECE SE FOR AGENDADA */}
                                    {!isCancelada && !isRealizada && (
                                        <button 
                                            className="btn-primary"
                                            style={{
                                                marginTop: '10px',
                                                fontSize: '0.85rem',
                                                padding: '0.5rem',
                                                width: '100%',
                                                backgroundColor: '#7c3aed',
                                                borderColor: '#7c3aed'
                                            }}
                                            onClick={() => navigate(`/atendimento/${consulta.id}`)}
                                        >
                                            Entrar na Sala
                                        </button>
                                    )}
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