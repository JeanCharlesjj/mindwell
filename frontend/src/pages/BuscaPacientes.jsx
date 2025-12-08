import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function BuscaPacientes() {
    const navigate = useNavigate();
    const [pacientes, setPacientes] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);

    const PSICOLOGO_ID = localStorage.getItem('usuario_id');

    // Função para buscar (usada ao carregar e ao clicar no botão)
    const carregarPacientes = (termo = '') => {
        setLoading(true);
        // Monta a URL: se tiver termo, manda o parametro 'nome', senão só manda o ID
        const url = termo 
            ? `/pacientes?psicologoId=${PSICOLOGO_ID}&nome=${termo}`
            : `/pacientes?psicologoId=${PSICOLOGO_ID}`;

        api.get(url)
            .then(response => {
                setPacientes(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erro:", error);
                setLoading(false);
            });
    };

    // Carrega a lista inicial assim que abre a tela
    useEffect(() => {
        if (!PSICOLOGO_ID) navigate('/');
        carregarPacientes();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="app-container">
            {/* --- MENU LATERAL (Reutilizado) --- */}
            <aside className="sidebar">
                <h2 style={{color: 'var(--primary-color)'}}>MindWell</h2>
                <div className="menu-item" onClick={() => navigate('/app')}>Dashboard</div>
                <div className="menu-item active">Meus Pacientes</div>
                <div className="menu-item" onClick={() => navigate('/consultas')}>Minhas Consultas</div>
                <div className="menu-item-logout" onClick={handleLogout}>🚪 Sair</div>
            </aside>

            {/* --- ÁREA PRINCIPAL --- */}
            <main className="main-content">
                <header className="header">
                    <h2>Meus Pacientes</h2>
                </header>

                {/* --- ÁREA DE BUSCA --- */}
                <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ margin: 0 }} // Remove margem padrão do input
                    />
                    <button 
                        className="btn-primary" 
                        style={{ width: 'auto', margin: 0, padding: '0.8rem 1.5rem' }}
                        onClick={() => carregarPacientes(busca)}
                    >
                        Buscar
                    </button>
                    {busca && (
                        <button 
                            style={{ width: 'auto', margin: 0, padding: '0.8rem', background: '#ccc', color: '#333' }}
                            onClick={() => { setBusca(''); carregarPacientes(''); }}
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {/* --- LISTA DE PACIENTES --- */}
                <div className="lista-consultas">
                    {loading && <p>Carregando...</p>}
                    {!loading && pacientes.length === 0 && <p>Nenhum paciente encontrado.</p>}

                    {pacientes.map(paciente => (
                        <div className="consulta-item" key={paciente.id}>
                            <div className="consulta-info">
                                <strong>{paciente.nome}</strong>
                                <span style={{fontSize: '0.9rem', color: '#666'}}>{paciente.email}</span>
                            </div>
                            <div className="consulta-time" style={{textAlign: 'right'}}>
                                <div className="consulta-date">{paciente.telefone}</div>
                                {/* Futuramente: Botão para ver histórico */}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default BuscaPacientes;