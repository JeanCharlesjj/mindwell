import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function FichaPaciente() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const USUARIO_ID = localStorage.getItem('usuario_id');
    const USUARIO_TIPO = localStorage.getItem('usuario_tipo');

    const [historico, setHistorico] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DO MODAL DE UPLOAD ---
    const [modalUploadAberto, setModalUploadAberto] = useState(false);
    const [arquivo, setArquivo] = useState(null);
    const [tituloArquivo, setTituloArquivo] = useState('');
    const [uploading, setUploading] = useState(false);

    const carregarDados = async () => {
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }

        try {
            // Busca histórico e documentos ao mesmo tempo!
            const [resHistorico, resDocumentos] = await Promise.all([
                api.get(`/consultas/historico/paciente/${id}`),
                api.get(`/documentos/paciente/${id}`)
            ]);
            
            setHistorico(resHistorico.data);
            setDocumentos(resDocumentos.data);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [id]);

    const formatarData = (dataStr) => {
        if (!dataStr) return '';
        return new Date(dataStr).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // --- LÓGICA DE UPLOAD PARA A AWS ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setArquivo(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!arquivo || !tituloArquivo.trim()) {
            alert("Por favor, dê um título e selecione um arquivo.");
            return;
        }

        setUploading(true);
        
        // Quando enviamos arquivos, precisamos usar o FormData em vez de JSON puro
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        formData.append('titulo', tituloArquivo);
        formData.append('pacienteId', id);
        formData.append('psicologoId', USUARIO_ID);

        try {
            await api.post('/documentos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setModalUploadAberto(false);
            setArquivo(null);
            setTituloArquivo('');
            carregarDados(); // Recarrega a tela para mostrar o novo documento!
        } catch (error) {
            console.error(error);
            alert("Erro ao fazer upload. Verifique o console.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="app-container"><p>Carregando prontuário...</p></div>;

    const nomePaciente = historico.length > 0 ? historico[0].nomePaciente : 'Paciente';

    return (
        <div className="app-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />

            <main className="main-content" style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#f8fafc' }}>
                
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#1f2937', fontSize: '1.8rem' }}>Prontuário Clínico</h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '1.1rem' }}>
                            Paciente: <strong>{nomePaciente}</strong>
                        </p>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate(-1)} style={{ margin: 0 }}>
                        Voltar
                    </button>
                </header>

                {/* --- SEÇÃO DE DOCUMENTOS (NOVIDADE) --- */}
                <section style={{ marginBottom: '3rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#334155' }}>Arquivos e Documentos</h3>
                        {USUARIO_TIPO === 'psicologo' && (
                            <button 
                                className="btn-primary" 
                                style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                onClick={() => setModalUploadAberto(true)}
                            >
                                + Anexar Documento
                            </button>
                        )}
                    </div>

                    {documentos.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Nenhum documento anexado ainda.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {documentos.map(doc => (
                                <div key={doc.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', background: '#f8fafc' }}>
                                    <strong style={{ display: 'block', color: '#1e293b', marginBottom: '0.5rem', fontSize: '0.95rem' }}>{doc.titulo}</strong>
                                    <small style={{ display: 'block', color: '#64748b', marginBottom: '1rem' }}>{new Date(doc.dataUpload).toLocaleDateString('pt-BR')}</small>
                                    
                                    <a 
                                        href={doc.urlAcesso} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ display: 'block', textAlign: 'center', background: '#e0e7ff', color: '#4f46e5', padding: '0.4rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' }}
                                    >
                                        Abrir Arquivo
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <hr style={{ border: 0, borderTop: '1px solid #e2e8f0', margin: '2rem 0' }} />

                {/* --- SEÇÃO DE HISTÓRICO DE CONSULTAS (MANTIDA) --- */}
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#334155' }}>Histórico de Sessões</h3>
                
                {historico.length === 0 ? (
                    <div style={{ background: '#fff', padding: '3rem', borderRadius: '12px', textAlign: 'center', color: '#6b7280', border: '1px dashed #cbd5e1' }}>
                        <p style={{ margin: 0 }}>Este paciente ainda não possui sessões registradas.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {historico.map(sessao => (
                            <div key={sessao.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', borderLeft: `5px solid ${sessao.status === 'REALIZADA' ? '#10b981' : '#9ca3af'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#334155' }}>
                                        📅 {formatarData(sessao.dataHora)}
                                    </span>
                                    <span style={{ background: sessao.status === 'REALIZADA' ? '#dcfce7' : '#f1f5f9', color: sessao.status === 'REALIZADA' ? '#15803d' : '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {sessao.status}
                                    </span>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Evolução / Anotações</h4>
                                    {sessao.anotacoes ? (
                                        <p style={{ whiteSpace: 'pre-wrap', color: '#1e293b', margin: 0, background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{sessao.anotacoes}</p>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Nenhuma anotação foi registrada.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {modalUploadAberto && (
                <div className="modal-overlay" onClick={() => setModalUploadAberto(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Anexar Novo Documento</h3>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>O arquivo será armazenado com segurança e criptografia.</p>
                        
                        <div className="input-group">
                            <label>Título do Documento</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Laudo Psiquiátrico, Encaminhamento..." 
                                value={tituloArquivo}
                                onChange={e => setTituloArquivo(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label>Selecione o Arquivo (PDF, JPG, PNG)</label>
                            <input 
                                type="file" 
                                accept=".pdf, image/*"
                                onChange={handleFileChange}
                                style={{ padding: '0.5rem 0' }}
                            />
                        </div>

                        <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ margin: 0, flex: 1 }} onClick={() => setModalUploadAberto(false)} disabled={uploading}>
                                Cancelar
                            </button>
                            <button className="btn-primary" style={{ margin: 0, flex: 1 }} onClick={handleUpload} disabled={uploading}>
                                {uploading ? 'Enviando...' : 'Fazer Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FichaPaciente;