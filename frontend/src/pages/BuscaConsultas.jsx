import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function BuscaConsultas() {
    const navigate = useNavigate();
    const [consultas, setConsultas] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DOS MODAIS ---
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false); // Formulário
    const [modalConfirmarEdicao, setModalConfirmarEdicao] = useState(false); // Pergunta "Tem certeza?"
    const [modalCancelarAberto, setModalCancelarAberto] = useState(false); // Pergunta "Tem certeza?" (Cancelamento)
    
    // Modal de Feedback (Substituto dos Alerts)
    const [modalFeedback, setModalFeedback] = useState({
        aberto: false,
        titulo: '',
        mensagem: '',
        tipo: 'sucesso' // 'sucesso' ou 'erro'
    });
    
    const [consultaSelecionada, setConsultaSelecionada] = useState(null);
    
    // Campos do formulário de edição
    const [dataEdit, setDataEdit] = useState('');
    const [horaEdit, setHoraEdit] = useState('');

    const PSICOLOGO_ID = localStorage.getItem('usuario_id');

    // --- CARREGAR CONSULTAS ---
    const carregarConsultas = (termo = '') => {
        setLoading(true);
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

    // --- FUNÇÃO AUXILIAR PARA MOSTRAR FEEDBACK ---
    const mostrarFeedback = (titulo, mensagem, tipo = 'sucesso') => {
        setModalFeedback({ aberto: true, titulo, mensagem, tipo });
    };

    const fecharFeedback = () => {
        setModalFeedback({ ...modalFeedback, aberto: false });
        carregarConsultas(); // Atualiza a lista ao fechar o feedback
    };

    // --- LÓGICA DE CANCELAMENTO ---
    const abrirModalCancelar = (consulta) => {
        setConsultaSelecionada(consulta);
        setModalCancelarAberto(true);
    };

    const confirmarCancelamento = async () => {
        try {
            await api.put(`/consultas/${consultaSelecionada.id}/cancelar`);
            setModalCancelarAberto(false);
            mostrarFeedback("Cancelado", "A consulta foi cancelada com sucesso.", "sucesso");
        } catch (error) {
            console.error(error);
            setModalCancelarAberto(false);
            mostrarFeedback("Erro", "Não foi possível cancelar a consulta.", "erro");
        }
    };

    // --- LÓGICA DE EDIÇÃO ---
    const abrirModalEdicao = (consulta) => {
        setConsultaSelecionada(consulta);
        const dataObj = new Date(consulta.dataHora);
        setDataEdit(dataObj.toISOString().split('T')[0]); 
        setHoraEdit(dataObj.toTimeString().slice(0, 5));  
        setModalEdicaoAberto(true);
    };

    // Passo 1: Usuário clica em "Salvar" no formulário -> Abre confirmação
    const preSalvarEdicao = () => {
        if (!dataEdit || !horaEdit) {
            mostrarFeedback("Atenção", "Preencha a data e o horário.", "erro");
            return;
        }
        setModalEdicaoAberto(false); // Fecha o form
        setModalConfirmarEdicao(true); // Abre a pergunta
    };

    // Passo 2: Usuário confirma -> Chama API
    const salvarEdicaoReal = async () => {
        try {
            const novaDataHora = `${dataEdit}T${horaEdit}:00`;

            await api.put('/consultas', {
                id: consultaSelecionada.id,
                dataHora: novaDataHora,
                anotacoes: null
            });

            setModalConfirmarEdicao(false);
            mostrarFeedback("Atualizado", "A data e horário foram alterados com sucesso.", "sucesso");

        } catch (error) {
            console.error("Erro:", error);
            setModalConfirmarEdicao(false);
            mostrarFeedback("Erro", "Falha ao atualizar o agendamento.", "erro");
        }
    };

    return (
        <div className="app-container">
            <Sidebar />

            <main className="main-content">
                <header className="header">
                    <h2>Gerenciar Consultas</h2>
                </header>

                {/* BUSCA */}
                <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome do paciente..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ margin: 0 }}
                    />
                    <button className="btn-primary" style={{ width: 'auto', margin: 0, padding: '0.8rem 1.5rem' }} onClick={() => carregarConsultas(busca)}>
                        Buscar
                    </button>
                    {busca && (
                        <button style={{ width: 'auto', margin: 0, padding: '0.8rem', background: '#ccc', color: '#333' }} onClick={() => { setBusca(''); carregarConsultas(''); }}>
                            Limpar
                        </button>
                    )}
                </div>

                {/* LISTA */}
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
                                    opacity: isCancelada ? 0.6 : 1,
                                    backgroundColor: isCancelada ? '#f3f4f6' : 'white',
                                    borderLeft: isCancelada ? '4px solid #9ca3af' : undefined
                                }}
                            >
                                <div className="consulta-info">
                                    <strong style={{textDecoration: isCancelada ? 'line-through' : 'none'}}>
                                        {consulta.nomePaciente}
                                    </strong>
                                    <span className="status-badge" style={{ backgroundColor: isCancelada ? '#9ca3af' : undefined, color: isCancelada ? 'white' : undefined }}>
                                        {consulta.status}
                                    </span>
                                </div>
                                <div className="consulta-time" style={{textAlign: 'right'}}>
                                    <div className="consulta-date">{new Date(consulta.dataHora).toLocaleDateString('pt-BR')}</div>
                                    <div className="consulta-hour" style={{color: isCancelada ? '#666' : 'var(--primary-color)', fontWeight: 'bold'}}>
                                        {new Date(consulta.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    {!isCancelada && (
                                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button style={{ background: 'none', border: '1px solid #ccc', color: '#333', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px' }} onClick={() => abrirModalEdicao(consulta)}>Editar</button>
                                            <button style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px' }} onClick={() => abrirModalCancelar(consulta)}>Cancelar</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* --- MODAL 1: FORMULÁRIO DE EDIÇÃO --- */}
            {modalEdicaoAberto && (
                <div className="modal-overlay" onClick={() => setModalEdicaoAberto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0}}>Remarcar Consulta</h3>
                        <div className="input-group">
                            <label>Nova Data</label>
                            <input type="date" value={dataEdit} onChange={e => setDataEdit(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Novo Horário</label>
                            <input type="time" value={horaEdit} onChange={e => setHoraEdit(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setModalEdicaoAberto(false)}>Cancelar</button>
                            <button className="btn-primary" style={{width: 'auto', margin: 0}} onClick={preSalvarEdicao}>
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: CONFIRMAÇÃO DE EDIÇÃO (NOVO) --- */}
            {modalConfirmarEdicao && (
                <div className="modal-overlay" onClick={() => setModalConfirmarEdicao(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{borderTop: '5px solid var(--primary-color)'}}>
                        <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>Confirmar Alteração?</h3>
                        <p>Você está alterando o agendamento para:</p>
                        <div style={{background: '#f0f9ff', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center'}}>
                            <strong>{new Date(dataEdit + 'T' + horaEdit).toLocaleDateString('pt-BR')}</strong> às <strong>{horaEdit}</strong>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => {
                                setModalConfirmarEdicao(false);
                                setModalEdicaoAberto(true); // Volta para o form se cancelar
                            }}>Voltar</button>
                            <button className="btn-primary" style={{width: 'auto', margin: 0}} onClick={salvarEdicaoReal}>
                                Sim, Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 3: CONFIRMAÇÃO DE CANCELAMENTO --- */}
            {modalCancelarAberto && consultaSelecionada && (
                <div className="modal-overlay" onClick={() => setModalCancelarAberto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{borderTop: '5px solid #ef4444'}}>
                        <h3 style={{marginTop: 0, color: '#ef4444'}}>Cancelar Agendamento?</h3>
                        <p>Você está prestes a cancelar a consulta de <strong>{consultaSelecionada.nomePaciente}</strong>.</p>
                        <div style={{background: '#fee2e2', padding: '10px', borderRadius: '8px', color: '#991b1b', marginBottom: '20px'}}>
                            <strong>Atenção:</strong> Esta ação é irreversível.
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setModalCancelarAberto(false)}>Voltar</button>
                            <button className="btn-primary" style={{width: 'auto', margin: 0, background: '#ef4444', borderColor: '#ef4444'}} onClick={confirmarCancelamento}>
                                Sim, Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 4: FEEDBACK GERAL (SUCESSO/ERRO) --- */}
            {modalFeedback.aberto && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign: 'center', maxWidth: '350px'}}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', 
                            background: modalFeedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', 
                            color: modalFeedback.tipo === 'sucesso' ? '#16a34a' : '#991b1b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '2rem'
                        }}>
                            {modalFeedback.tipo === 'sucesso' ? '✓' : '✕'}
                        </div>
                        <h3 style={{marginBottom: '0.5rem', color: modalFeedback.tipo === 'sucesso' ? '#16a34a' : '#991b1b'}}>
                            {modalFeedback.titulo}
                        </h3>
                        <p style={{color: '#666', marginBottom: '1.5rem'}}>{modalFeedback.mensagem}</p>
                        <button className="btn-primary" style={{width: '100%', margin: 0}} onClick={fecharFeedback}>
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuscaConsultas;