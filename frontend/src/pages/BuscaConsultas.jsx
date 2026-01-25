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
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
    const [modalConfirmarEdicao, setModalConfirmarEdicao] = useState(false);
    const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
    
    const [modalFeedback, setModalFeedback] = useState({
        aberto: false, titulo: '', mensagem: '', tipo: 'sucesso'
    });
    
    const [consultaSelecionada, setConsultaSelecionada] = useState(null);
    const [dataEdit, setDataEdit] = useState('');
    const [horaEdit, setHoraEdit] = useState('');

    const PSICOLOGO_ID = localStorage.getItem('usuario_id');

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

    // --- FUNÇÕES DE FEEDBACK E MODAIS  ---
    const mostrarFeedback = (titulo, mensagem, tipo = 'sucesso') => {
        setModalFeedback({ aberto: true, titulo, mensagem, tipo });
    };
    const fecharFeedback = () => {
        setModalFeedback({ ...modalFeedback, aberto: false });
        carregarConsultas(); 
    };
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
            setModalCancelarAberto(false);
            mostrarFeedback("Erro", "Não foi possível cancelar a consulta.", "erro");
        }
    };
    const abrirModalEdicao = (consulta) => {
        setConsultaSelecionada(consulta);
        const dataObj = new Date(consulta.dataHora);
        setDataEdit(dataObj.toISOString().split('T')[0]); 
        setHoraEdit(dataObj.toTimeString().slice(0, 5));  
        setModalEdicaoAberto(true);
    };
    const preSalvarEdicao = () => {
        if (!dataEdit || !horaEdit) {
            mostrarFeedback("Atenção", "Preencha a data e o horário.", "erro");
            return;
        }
        setModalEdicaoAberto(false); 
        setModalConfirmarEdicao(true); 
    };
    const salvarEdicaoReal = async () => {
        try {
            const novaDataHora = `${dataEdit}T${horaEdit}:00`;
            await api.put('/consultas', {
                id: consultaSelecionada.id,
                dataHora: novaDataHora,
                anotacoes: null
            });
            setModalConfirmarEdicao(false);
            mostrarFeedback("Atualizado", "A data e horário foram alterados.", "sucesso");
        } catch (error) {
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

                <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" placeholder="Buscar por nome do paciente..." 
                        value={busca} onChange={(e) => setBusca(e.target.value)} style={{ margin: 0 }}
                    />
                    <button className="btn-primary" style={{ width: 'auto', margin: 0, padding: '0.8rem 1.5rem' }} onClick={() => carregarConsultas(busca)}>
                        Buscar
                    </button>
                    {busca && (
                        <button style={{ width: 'auto', margin: 0, padding: '0.8rem', background: '#ccc', color: '#333' }} onClick={() => { setBusca(''); carregarConsultas(''); }}>Limpar</button>
                    )}
                </div>

                <div className="lista-consultas">
                    {loading && <p>Carregando...</p>}
                    {!loading && consultas.length === 0 && <p>Nenhuma consulta encontrada.</p>}

                    {consultas.map(consulta => {
                        const isCancelada = consulta.status === 'CANCELADA';
                        const isRealizada = consulta.status === 'REALIZADA';

                        // Lógica de Cores Visual
                        let corBorda = 'var(--primary-color)';
                        let corFundo = 'white';
                        let opacidade = 1;
                        let corStatus = '#f59e0b'; // Pendente (Laranja)

                        if (isCancelada) {
                            corBorda = '#9ca3af';
                            corFundo = '#f3f4f6';
                            opacidade = 0.6;
                            corStatus = '#9ca3af';
                        } else if (isRealizada) {
                            corBorda = '#10b981'; // Verde
                            corFundo = '#ecfdf5'; // Verde Claro
                            corStatus = '#10b981';
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
                                        {consulta.nomePaciente}
                                    </strong>
                                    <span className="status-badge" style={{ backgroundColor: corStatus, color: 'white' }}>
                                        {isRealizada ? '✓ CONCLUÍDA' : consulta.status}
                                    </span>
                                </div>
                                <div className="consulta-time" style={{textAlign: 'right'}}>
                                    <div className="consulta-date">{new Date(consulta.dataHora).toLocaleDateString('pt-BR')}</div>
                                    <div className="consulta-hour" style={{color: isCancelada ? '#666' : corBorda, fontWeight: isCancelada ? 'normal' : 'bold'}}>
                                        {new Date(consulta.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    
                                    {!isCancelada && !isRealizada && (
                                         <button 
                                            className="btn-primary"
                                            style={{ marginTop: '8px', marginBottom: '8px', fontSize: '0.85rem', padding: '0.4rem 0.8rem', backgroundColor: '#7c3aed', borderColor: '#7c3aed', width: 'auto', marginRight: '0' }}
                                            onClick={() => navigate(`/atendimento/${consulta.id}`)}
                                        >
                                            Sala Virtual
                                        </button>
                                    )}

                                    {/* Botões de Ação (Só se for Agendada) */}
                                    {!isCancelada && !isRealizada && (
                                        <div style={{ marginTop: '5px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button style={{ background: 'none', border: '1px solid #ccc', color: '#333', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px' }} onClick={() => abrirModalEdicao(consulta)}>Editar</button>
                                            <button style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px' }} onClick={() => abrirModalCancelar(consulta)}>Cancelar</button>
                                        </div>
                                    )}

                                    {/* Feedback se foi realizada */}
                                    {isRealizada && (
                                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>
                                            Sessão Finalizada
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* --- MODAIS (EDICAO, CONFIRMACAO, CANCELAR, FEEDBACK) --- */}
            {modalEdicaoAberto && (
                <div className="modal-overlay" onClick={() => setModalEdicaoAberto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0}}>Remarcar Consulta</h3>
                        <div className="input-group"><label>Nova Data</label><input type="date" value={dataEdit} onChange={e => setDataEdit(e.target.value)} /></div>
                        <div className="input-group"><label>Novo Horário</label><input type="time" value={horaEdit} onChange={e => setHoraEdit(e.target.value)} /></div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setModalEdicaoAberto(false)}>Cancelar</button>
                            <button className="btn-primary" style={{width: 'auto', margin: 0}} onClick={preSalvarEdicao}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
            {modalConfirmarEdicao && (
                <div className="modal-overlay" onClick={() => setModalConfirmarEdicao(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{borderTop: '5px solid var(--primary-color)'}}>
                        <h3 style={{marginTop: 0, color: 'var(--primary-color)'}}>Confirmar Alteração?</h3>
                        <p>Nova data: <strong>{new Date(dataEdit + 'T' + horaEdit).toLocaleDateString('pt-BR')}</strong> às <strong>{horaEdit}</strong></p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => {setModalConfirmarEdicao(false); setModalEdicaoAberto(true);}}>Voltar</button>
                            <button className="btn-primary" style={{width: 'auto', margin: 0}} onClick={salvarEdicaoReal}>Sim, Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
            {modalCancelarAberto && consultaSelecionada && (
                <div className="modal-overlay" onClick={() => setModalCancelarAberto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{borderTop: '5px solid #ef4444'}}>
                        <h3 style={{marginTop: 0, color: '#ef4444'}}>Cancelar Agendamento?</h3>
                        <p>Paciente: <strong>{consultaSelecionada.nomePaciente}</strong></p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setModalCancelarAberto(false)}>Voltar</button>
                            <button className="btn-primary" style={{width: 'auto', margin: 0, background: '#ef4444', borderColor: '#ef4444'}} onClick={confirmarCancelamento}>Sim, Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            {modalFeedback.aberto && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign: 'center', maxWidth: '350px'}}>
                        <div style={{width: '60px', height: '60px', borderRadius: '50%', background: modalFeedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', color: modalFeedback.tipo === 'sucesso' ? '#16a34a' : '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '2rem'}}>
                            {modalFeedback.tipo === 'sucesso' ? '✓' : '✕'}
                        </div>
                        <h3>{modalFeedback.titulo}</h3>
                        <p>{modalFeedback.mensagem}</p>
                        <button className="btn-primary" style={{width: '100%'}} onClick={fecharFeedback}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuscaConsultas;