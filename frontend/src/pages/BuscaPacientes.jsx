import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function BuscaPacientes() {
    const navigate = useNavigate();
    const [pacientes, setPacientes] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DOS MODAIS ---
    const [modalAberto, setModalAberto] = useState(false);
    const [modalSucesso, setModalSucesso] = useState(false); // Novo estado
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    
    // Campos do formulário
    const [dataAgendamento, setDataAgendamento] = useState('');
    const [horaAgendamento, setHoraAgendamento] = useState('');

    const PSICOLOGO_ID = localStorage.getItem('usuario_id');

    // --- CARREGAR PACIENTES ---
    const carregarPacientes = (termo = '') => {
        setLoading(true);
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

    useEffect(() => {
        if (!PSICOLOGO_ID) navigate('/');
        carregarPacientes();
    }, []);

    // --- LÓGICA DO AGENDAMENTO ---
    const abrirModalAgendamento = (paciente) => {
        setPacienteSelecionado(paciente);
        setModalAberto(true);
        setDataAgendamento('');
        setHoraAgendamento('');
    };

    const fecharModal = () => {
        setModalAberto(false);
        setPacienteSelecionado(null);
    };

    const confirmarAgendamento = async () => {
        if (!dataAgendamento || !horaAgendamento) {
            alert("Por favor, preencha data e hora."); // Esse alerta simples de validação pode manter, ou podemos tratar depois
            return;
        }

        try {
            const dataHoraISO = `${dataAgendamento}T${horaAgendamento}:00`;

            await api.post('/consultas', {
                idPsicologo: PSICOLOGO_ID,       
                idPaciente: pacienteSelecionado.id, 
                dataHora: dataHoraISO
            });

            // Fecha o formulário e abre o sucesso
            fecharModal();
            setModalSucesso(true);

        } catch (error) {
            console.error(error);
            alert("Erro ao agendar consulta.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="app-container">
            {/* --- MENU LATERAL --- */}
            <Sidebar />

            {/* --- ÁREA PRINCIPAL --- */}
            <main className="main-content">
                <header className="header">
                    <h2>Gerenciar Pacientes</h2>
                </header>

                {/* --- BUSCA --- */}
                <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ margin: 0 }}
                    />
                    <button className="btn-primary" style={{ width: 'auto', margin: 0, padding: '0.8rem 1.5rem' }} onClick={() => carregarPacientes(busca)}>
                        Buscar
                    </button>
                    {busca && (
                        <button style={{ width: 'auto', margin: 0, padding: '0.8rem' }} onClick={() => { setBusca(''); carregarPacientes(''); }}>
                            Limpar
                        </button>
                    )}
                </div>

                {/* --- LISTA --- */}
                <div className="lista-consultas">
                    {loading && <p>Carregando...</p>}
                    {!loading && pacientes.length === 0 && <p>Nenhum paciente encontrado.</p>}

                    {pacientes.map(paciente => (
                        <div className="consulta-item" key={paciente.id}>
                            <div className="consulta-info">
                                <strong>{paciente.nome}</strong>
                                <span style={{fontSize: '0.9rem', color: '#666'}}>{paciente.email}</span>
                            </div>
                            <div className="consulta-time" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                <div className="consulta-date" style={{marginRight: '10px'}}>{paciente.telefone}</div>
                                
                                <button 
                                    className="btn-primary" 
                                    style={{padding: '0.5rem 1rem', fontSize: '0.85rem', margin: 0}}
                                    onClick={() => abrirModalAgendamento(paciente)}
                                >
                                    Agendar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* --- MODAL DE AGENDAMENTO (Formulário) --- */}
            {modalAberto && pacienteSelecionado && (
                <div className="modal-overlay" onClick={fecharModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0}}>Agendar com {pacienteSelecionado.nome}</h3>
                        <p style={{color: '#666', marginBottom: '1.5rem'}}>Escolha o melhor horário para a sessão.</p>
                        
                        <div className="input-group">
                            <label>Data</label>
                            <input type="date" value={dataAgendamento} onChange={e => setDataAgendamento(e.target.value)} />
                        </div>
                        
                        <div className="input-group">
                            <label>Horário</label>
                            <input type="time" value={horaAgendamento} onChange={e => setHoraAgendamento(e.target.value)} />
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={fecharModal}>Cancelar</button>
                            <button className="btn-primary" style={{width: 'auto', margin: 0}} onClick={confirmarAgendamento}>
                                Confirmar Agendamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL DE SUCESSO (Novo) --- */}
            {modalSucesso && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign: 'center', maxWidth: '350px'}}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto',
                            fontSize: '2rem'
                        }}>
                            ✓
                        </div>
                        <h3 style={{marginBottom: '0.5rem', color: '#16a34a'}}>Agendamento Confirmado!</h3>
                        <p style={{color: '#666', marginBottom: '1.5rem'}}>A consulta foi salva na sua agenda com sucesso.</p>
                        
                        <button 
                            className="btn-primary" 
                            style={{width: '100%', margin: 0}} 
                            onClick={() => {
                                setModalSucesso(false);
                                navigate('/consultas'); // Redireciona para ver a agenda
                            }}
                        >
                            Ver minha Agenda
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuscaPacientes;