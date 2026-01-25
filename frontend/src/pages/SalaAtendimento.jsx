import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function SalaAtendimento() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    // Estados de Dados
    const [consulta, setConsulta] = useState(null);
    const [anotacoes, setAnotacoes] = useState('');
    const [loading, setLoading] = useState(true);
    const [encerrando, setEncerrando] = useState(false);
    
    // Estado do Cronômetro
    const [tempoRestante, setTempoRestante] = useState("--:--"); 
    const [corCronometro, setCorCronometro] = useState('#6b7280');

    // --- ESTADOS DOS MODAIS ---
    const [modalConfirmacao, setModalConfirmacao] = useState(false); // Novo: Pergunta se quer sair
    const [modalFeedback, setModalFeedback] = useState({             // Existente: Avisa que deu certo/erro
        aberto: false,
        titulo: '',
        mensagem: '',
        tipo: 'sucesso'
    });

    // Referências do Jitsi
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    const USUARIO_TIPO = localStorage.getItem('usuario_tipo');
    const USUARIO_NOME = localStorage.getItem('usuario_nome');
    const isPsicologo = USUARIO_TIPO === 'psicologo';

    const idLimpo = id.replace(/[^a-zA-Z0-9]/g, '');
    const nomeSalaJitsi = `MindWell-Sessao-${idLimpo}`;

    // 1. BUSCAR DADOS
    useEffect(() => {
        api.get(`/consultas/${id}`)
            .then(response => {
                setConsulta(response.data);
                setAnotacoes(response.data.anotacoes || '');
                setLoading(false);
            })
            .catch(error => {
                console.error("Erro:", error);
                navigate('/app');
            });
    }, [id, navigate]);

    // 2. CRONÔMETRO
    useEffect(() => {
        if (!consulta || !isPsicologo) return;

        if (!consulta.dataInicioReal) {
            setTempoRestante(`${consulta.tempoSessao || 50}:00`);
            setCorCronometro('#6b7280'); 
            return;
        }

        const calcular = () => {
            const inicio = new Date(consulta.dataInicioReal).getTime();
            const duracaoMs = (consulta.tempoSessao || 50) * 60 * 1000;
            const fim = inicio + duracaoMs;
            const agora = new Date().getTime();
            const diferenca = fim - agora;

            if (diferenca <= 0) {
                setTempoRestante("00:00");
                setCorCronometro('#ef4444');
            } else {
                const horas = Math.floor(diferenca / (1000 * 60 * 60));
                const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

                const h = horas > 0 ? `${horas.toString().padStart(2, '0')}:` : '';
                const m = minutos.toString().padStart(2, '0');
                const s = segundos.toString().padStart(2, '0');

                setTempoRestante(`${h}${m}:${s}`);

                if (minutos < 5 && horas === 0) setCorCronometro('#f59e0b');
                else setCorCronometro('#16a34a');
            }
        };

        calcular(); 
        const interval = setInterval(calcular, 1000); 
        return () => clearInterval(interval);

    }, [consulta, isPsicologo]);

    // 3. JITSI
    useEffect(() => {
        if (loading) return; 

        const servidorJitsi = 'meet.guifi.net';

        const carregarScript = () => {
            if (document.querySelector(`script[src*="${servidorJitsi}"]`)) {
                if (window.JitsiMeetExternalAPI) iniciarJitsi();
                return;
            }
            const script = document.createElement('script');
            script.src = `https://${servidorJitsi}/external_api.js`;
            script.async = true;
            script.onload = () => iniciarJitsi();
            document.body.appendChild(script);
        };

        const iniciarJitsi = () => {
            if (!jitsiContainerRef.current) return;
            if (jitsiApiRef.current) return; 

            const options = {
                roomName: nomeSalaJitsi,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: { displayName: USUARIO_NOME },
                lang: 'pt',
                configOverwrite: {
                    prejoinPageEnabled: false,
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    disableDeepLinking: true,
                    skipPrejoin: true,
                    requireDisplayName: false
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'chat', 'settings', 
                        'raisehand', 'videoquality', 'tileview'
                    ]
                }
            };

            try {
                const apiJitsi = new window.JitsiMeetExternalAPI(servidorJitsi, options);
                jitsiApiRef.current = apiJitsi;

                apiJitsi.addEventListener('videoConferenceLeft', () => navigate('/app'));

                apiJitsi.addEventListener('videoConferenceJoined', () => {
                    if (isPsicologo) {
                        api.put(`/consultas/${id}/iniciar`)
                            .then(() => {
                                setConsulta(prev => ({
                                    ...prev,
                                    dataInicioReal: new Date().toISOString()
                                }));
                            })
                            .catch(err => console.error("Erro tempo:", err));
                    }
                });

            } catch (err) { console.error("Erro Jitsi:", err); }
        };

        carregarScript();

        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
        };
    }, [loading, id, isPsicologo, nomeSalaJitsi, USUARIO_NOME, navigate]); 

    // 1. Clicou no botão de encerrar -> Abre Modal de Confirmação
    const handleCliqueEncerrar = () => {
        setModalConfirmacao(true);
    };

    // 2. Confirmou no Modal -> Executa a ação real
    const confirmarEncerramento = async () => {
        setModalConfirmacao(false); // Fecha a pergunta
        setEncerrando(true);        // Mostra loading no botão principal (opcional)

        try {
            await api.put(`/consultas/${id}/finalizar`, {
                anotacoes: anotacoes 
            });

            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }

            setModalFeedback({
                aberto: true,
                tipo: 'sucesso',
                titulo: 'Sessão Finalizada! 👏',
                mensagem: 'O prontuário foi salvo e a consulta marcada como realizada.'
            });

        } catch (error) {
            console.error(error);
            setModalFeedback({
                aberto: true,
                tipo: 'erro',
                titulo: 'Ops!',
                mensagem: 'Houve um erro ao finalizar a consulta. Tente novamente.'
            });
            setEncerrando(false);
        }
    };

    const fecharFeedback = () => {
        setModalFeedback({ ...modalFeedback, aberto: false });
        if (modalFeedback.tipo === 'sucesso') {
            navigate('/app');
        }
    };

    if (loading) return <div className="app-container"><p>Carregando sala...</p></div>;

    return (
        <div className="app-container" style={{ height: '100vh', overflow: 'hidden' }}>
            <Sidebar />

            <main className="main-content" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                <header className="header" style={{ padding: '0.8rem 2rem', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                        <h2 style={{margin: 0, fontSize: '1.1rem'}}>
                            Em atendimento: <span style={{color: 'var(--primary-color)'}}>
                                {isPsicologo ? consulta.nomePaciente : consulta.nomePsicologo}
                            </span>
                        </h2>

                        {isPsicologo && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                background: '#f3f4f6', padding: '5px 12px', borderRadius: '20px',
                                border: `1px solid ${corCronometro}`
                            }}>
                                <span>⏱️</span>
                                <span style={{fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace', color: corCronometro}}>
                                    {tempoRestante}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isPsicologo && (
                        <button className="btn-primary" style={{background: '#ef4444', borderColor: '#ef4444', padding: '0.4rem 1rem', width: 'auto', margin: 0}} onClick={() => navigate('/app')}>
                            Sair
                        </button>
                    )}
                </header>

                <div style={{ display: 'flex', flex: 1, height: 'calc(100% - 60px)' }}>
                    <div ref={jitsiContainerRef} style={{ flex: isPsicologo ? 2 : 1, background: '#1f2937' }}></div>

                    {isPsicologo && (
                        <div style={{ flex: 1, background: '#f8fafc', borderLeft: '1px solid #eee', display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
                            <div style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                                📝 Prontuário
                            </div>
                            <textarea
                                style={{ flex: 1, width: '100%', padding: '1rem', border: 'none', resize: 'none', outline: 'none', fontSize: '1rem', fontFamily: 'sans-serif' }}
                                placeholder="Evolução..."
                                value={anotacoes}
                                onChange={(e) => setAnotacoes(e.target.value)}
                            ></textarea>
                            
                            <div style={{ padding: '1rem', background: '#fff', borderTop: '1px solid #eee' }}>
                                <button 
                                    className="btn-primary" 
                                    style={{ 
                                        width: '100%', 
                                        margin: 0, 
                                        backgroundColor: '#ef4444', 
                                        borderColor: '#ef4444',
                                        fontWeight: 'bold'
                                    }} 
                                    onClick={handleCliqueEncerrar}
                                    disabled={encerrando}
                                >
                                    {encerrando ? 'Encerrando...' : 'Encerrar Chamada e Salvar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* --- MODAL 1: CONFIRMAÇÃO (PERGUNTA) --- */}
            {modalConfirmacao && (
                <div className="modal-overlay" onClick={() => setModalConfirmacao(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '400px', borderTop: '5px solid #ef4444'}}>
                        <h3 style={{marginTop: 0, color: '#ef4444'}}>Encerrar Atendimento?</h3>
                        <p style={{color: '#666', lineHeight: '1.5'}}>
                            Tem certeza que deseja finalizar a sessão?<br/>
                            Isso irá <strong>salvar o prontuário</strong> e marcar a consulta como <strong>Realizada</strong>.
                        </p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setModalConfirmacao(false)}>
                                Cancelar
                            </button>
                            <button 
                                className="btn-primary" 
                                style={{width: 'auto', margin: 0, backgroundColor: '#ef4444', borderColor: '#ef4444'}} 
                                onClick={confirmarEncerramento}
                            >
                                Sim, Encerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: FEEDBACK (RESPOSTA) --- */}
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
                            {modalFeedback.tipo === 'sucesso' ? 'Voltar ao Início' : 'Fechar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SalaAtendimento;