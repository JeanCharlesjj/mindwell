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

    const [modalCancelamentoAberto, setModalCancelamentoAberto] = useState(false);
    const [consultaCancelamento, setConsultaCancelamento] = useState(null);
    const [motivoCancelamento, setMotivoCancelamento] = useState('');

    const carregarConsultas = () => {
        setLoading(true);
        const url = USUARIO_TIPO === 'psicologo' 
            ? `/consultas?psicologoId=${USUARIO_ID}`
            : `/consultas?pacienteId=${USUARIO_ID}`;

        api.get(url)
            .then(res => {
                setConsultas(res.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    };

    useEffect(() => {
        if (!USUARIO_ID) { window.location.href = "/"; return; }
        carregarConsultas();
    }, [USUARIO_ID, USUARIO_TIPO]);

    const isPsicologo = USUARIO_TIPO === 'psicologo';
    
    const consultasExibidas = isPsicologo 
        ? consultas 
        : consultas.filter(c => c.status === 'AGENDADA');

    const agendamentosAtivos = consultas.filter(c => c.status === 'AGENDADA').length;
    
    const tituloCard = isPsicologo ? 'Consultas Pendentes' : 'Próximas Sessões';
    const corDestaque = isPsicologo ? "var(--primary-color)" : "#10b981";

    const abrirModalCancelamento = (consulta) => {
        setConsultaCancelamento(consulta);
        setMotivoCancelamento('');
        setModalCancelamentoAberto(true);
    };

    const fecharModalCancelamento = () => {
        setModalCancelamentoAberto(false);
        setConsultaCancelamento(null);
    };

    const confirmarCancelamento = async () => {
        if (!motivoCancelamento.trim()) {
            alert("Por favor, informe o motivo do cancelamento.");
            return;
        }

        try {
            await api.put(`/consultas/${consultaCancelamento.id}/cancelar`, {
                motivo: motivoCancelamento
            });
            
            fecharModalCancelamento();
            carregarConsultas();
        } catch (error) {
            console.error(error);
            alert("Erro ao cancelar a consulta.");
        }
    };

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

                <h3 className="section-title">
                    {isPsicologo ? 'Histórico e Agendamentos' : 'Suas Próximas Sessões'}
                </h3>
                
                <div className="lista-consultas">
                    {loading && <p>Carregando...</p>}
                    
                    {!loading && consultasExibidas.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666', background: '#fff', borderRadius: '8px', border: '1px dashed #ccc' }}>
                            {isPsicologo 
                                ? "Nenhuma consulta encontrada." 
                                : "Você não possui nenhuma sessão agendada no momento."}
                        </div>
                    )}

                    {consultasExibidas.map(consulta => {
                        const isCancelada = consulta.status === 'CANCELADA';
                        const isRealizada = consulta.status === 'REALIZADA';
                        
                        let corBorda = corDestaque;
                        let corFundo = 'white';
                        let opacidade = 1;
                        let corStatus = '#3b82f6'; 

                        if (isCancelada) {
                            corBorda = '#9ca3af'; 
                            corFundo = '#f3f4f6';
                            opacidade = 0.6;
                            corStatus = '#9ca3af';
                        } else if (isRealizada) {
                            corBorda = '#10b981'; 
                            corFundo = '#ecfdf5'; 
                            corStatus = '#10b981';
                        } else {
                            corStatus = '#f59e0b'; 
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
                                        style={{ backgroundColor: corStatus, color: 'white' }}
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
                                    
                                    {!isCancelada && !isRealizada && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                            <button 
                                                className="btn-primary"
                                                style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem', backgroundColor: '#7c3aed', borderColor: '#7c3aed', margin: 0 }}
                                                onClick={() => navigate(`/atendimento/${consulta.id}`)}
                                            >
                                                Entrar na Sala
                                            </button>
                                            <button 
                                                className="btn-cancel"
                                                style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem', margin: 0 }}
                                                onClick={() => abrirModalCancelamento(consulta)}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}

                                    {isRealizada && isPsicologo && (
                                        <button 
                                            className="btn-secondary"
                                            style={{
                                                marginTop: '10px', fontSize: '0.85rem', padding: '0.5rem', width: '100%',
                                                backgroundColor: '#ecfdf5', color: '#10b981', borderColor: '#10b981',
                                                border: '1px solid', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                                            }}
                                            onClick={() => navigate(`/prontuario/${consulta.idPaciente}`)}
                                        >
                                            Ver Prontuário
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {modalCancelamentoAberto && consultaCancelamento && (
                <div className="modal-overlay" onClick={fecharModalCancelamento}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, color: '#ef4444' }}>Cancelar Consulta</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Você está prestes a cancelar a sessão do dia <strong>{new Date(consultaCancelamento.dataHora).toLocaleDateString('pt-BR')}</strong> às <strong>{new Date(consultaCancelamento.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</strong>.
                        </p>
                        
                        <div className="input-group">
                            <label>Motivo do Cancelamento (Obrigatório)</label>
                            <textarea 
                                rows="3" 
                                value={motivoCancelamento} 
                                onChange={e => setMotivoCancelamento(e.target.value)}
                                placeholder="Descreva brevemente o motivo..."
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
                            />
                        </div>

                        <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ margin: 0, flex: 1 }} onClick={fecharModalCancelamento}>Voltar</button>
                            <button 
                                className="btn-primary" 
                                style={{ margin: 0, flex: 1, backgroundColor: '#ef4444', borderColor: '#ef4444' }} 
                                onClick={confirmarCancelamento}
                            >
                                Confirmar Cancelamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;