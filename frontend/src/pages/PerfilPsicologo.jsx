import { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function PerfilPsicologo() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [tempoSessao, setTempoSessao] = useState(50);
    const [loading, setLoading] = useState(true);

    const ID = localStorage.getItem('usuario_id');
    const TIPO = localStorage.getItem('usuario_tipo');

    useEffect(() => {
        if (TIPO !== 'psicologo') return;

        api.get(`/psicologos/${ID}`)
            .then(res => {
                setNome(res.data.nome);
                setEmail(res.data.email);
                setTempoSessao(res.data.tempoSessao || 50);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [ID, TIPO]);

    const salvar = async () => {
        try {
            await api.put('/psicologos', {
                id: ID,
                nome,
                email,
                tempoSessao: parseInt(tempoSessao)
            });
            alert('Perfil atualizado com sucesso!');
            localStorage.setItem('usuario_nome', nome);
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar perfil.');
        }
    };

    if (TIPO !== 'psicologo') return <div className="app-container"><Sidebar/><main className="main-content"><h3>Apenas para Psicólogos</h3></main></div>;

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <header className="header">
                    <h2>Meu Perfil ⚙️</h2>
                </header>

                <div className="card" style={{maxWidth: '600px'}}>
                    <h3>Configurações de Atendimento</h3>
                    
                    <div className="input-group">
                        <label>Nome Completo</label>
                        <input type="text" value={nome} onChange={e => setNome(e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>E-mail</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled style={{background: '#eee'}} />
                    </div>

                    <div className="input-group">
                        <label>Duração Padrão da Sessão (minutos)</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <input 
                                type="number" 
                                value={tempoSessao} 
                                onChange={e => setTempoSessao(e.target.value)} 
                                style={{width: '100px'}}
                            />
                            <span style={{color: '#666'}}>minutos</span>
                        </div>
                        <small style={{color: '#888'}}>Este tempo será usado no cronômetro da sala de atendimento.</small>
                    </div>

                    <button className="btn-primary" onClick={salvar} style={{marginTop: '1rem'}}>
                        Salvar Alterações
                    </button>
                </div>
            </main>
        </div>
    );
}

export default PerfilPsicologo;