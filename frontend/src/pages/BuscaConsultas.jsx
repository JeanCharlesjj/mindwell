import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function BuscaConsultas() {
    const navigate = useNavigate();
    const [consultas, setConsultas] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);

    const PSICOLOGO_ID = localStorage.getItem('usuario_id');

    // Função de busca
    const carregarConsultas = (termo = '') => {
        setLoading(true);
        // Se tiver termo, busca por nomePaciente, senão traz tudo do psicólogo
        const url = termo 
            ? `/consultas?psicologoId=${PSICOLOGO_ID}&nomePaciente=${termo}`
            : `/consultas?psicologoId=${PSICOLOGO_ID}`;

        api.get(url)
            .then(response => {
                setConsultas(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erro:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!PSICOLOGO_ID) navigate('/');
        carregarConsultas();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="app-container">
            {/* --- MENU LATERAL --- */}
            <aside className="sidebar">
                <h2 style={{color: 'var(--primary-color)'}}>MindWell</h2>
                <div className="menu-item" onClick={() => navigate('/app')}>Dashboard</div>
                <div className="menu-item" onClick={() => navigate('/pacientes')}>Meus Pacientes</div>
                <div className="menu-item active">Minhas Consultas</div>
                <div className="menu-item-logout" onClick={handleLogout}>🚪 Sair</div>
            </aside>

            {/* --- CONTEÚDO --- */}
            <main className="main-content">
                <header className="header">
                    <h2>Histórico de Consultas</h2>
                </header>

                {/* --- BUSCA --- */}
                <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome do paciente..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ margin: 0 }}
                    />
                    <button 
                        className="btn-primary" 
                        style={{ width: 'auto', margin: 0, padding: '0.8rem 1.5rem' }}
                        onClick={() => carregarConsultas(busca)}
                    >
                        Buscar
                    </button>
                    {busca && (
                        <button 
                            style={{ width: 'auto', margin: 0, padding: '0.8rem', background: '#ccc', color: '#333' }}
                            onClick={() => { setBusca(''); carregarConsultas(''); }}
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {/* --- LISTA --- */}
                <div className="lista-consultas">
                    {loading && <p>Carregando...</p>}
                    {!loading && consultas.length === 0 && <p>Nenhuma consulta encontrada.</p>}

                    {consultas.map(consulta => (
                        <div className="consulta-item" key={consulta.id}>
                            <div className="consulta-info">
                                <strong>{consulta.nomePaciente}</strong>
                                <span className="status-badge">{consulta.status}</span>
                                {consulta.anotacoes && <div style={{fontSize:'0.8rem', color: 'gray', marginTop: '5px'}}>📝 Contém anotação</div>}
                            </div>
                            
                            <div className="consulta-time" style={{textAlign: 'right'}}>
                                <div className="consulta-date">
                                    {new Date(consulta.dataHora).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="consulta-hour" style={{color: 'var(--primary-color)'}}>
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

export default BuscaConsultas;