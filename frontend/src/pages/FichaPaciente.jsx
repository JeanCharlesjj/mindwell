import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function FichaPaciente() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }

        api.get(`/consultas/historico/paciente/${id}`)
            .then(response => {
                setHistorico(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar histórico:", error);
                setLoading(false);
            });
    }, [id]);

    const formatarData = (dataStr) => {
        if (!dataStr) return '';
        return new Date(dataStr).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
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
                    <button className="btn-cancel" onClick={() => navigate(-1)} style={{ margin: 0 }}>
                        Voltar
                    </button>
                </header>

                {historico.length === 0 ? (
                    <div style={{ background: '#fff', padding: '3rem', borderRadius: '12px', textAlign: 'center', color: '#6b7280', border: '1px dashed #cbd5e1' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>Nenhum histórico encontrado</h3>
                        <p style={{ margin: 0 }}>Este paciente ainda não possui sessões registradas.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {historico.map(sessao => (
                            <div key={sessao.id} style={{ 
                                background: '#fff', 
                                padding: '1.5rem', 
                                borderRadius: '12px', 
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
                                borderLeft: `5px solid ${sessao.status === 'REALIZADA' ? '#10b981' : '#9ca3af'}` 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#334155' }}>
                                        {formatarData(sessao.dataHora)}
                                    </span>
                                    <span style={{
                                        background: sessao.status === 'REALIZADA' ? '#dcfce7' : '#f1f5f9',
                                        color: sessao.status === 'REALIZADA' ? '#15803d' : '#475569',
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'
                                    }}>
                                        {sessao.status}
                                    </span>
                                </div>
                                
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Evolução / Anotações
                                    </h4>
                                    {sessao.anotacoes ? (
                                        <p style={{ 
                                            whiteSpace: 'pre-wrap', 
                                            color: '#1e293b', 
                                            margin: 0, 
                                            lineHeight: '1.6',
                                            background: '#f8fafc',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            {sessao.anotacoes}
                                        </p>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                                            Nenhuma anotação foi registrada pelo profissional nesta sessão.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default FichaPaciente;