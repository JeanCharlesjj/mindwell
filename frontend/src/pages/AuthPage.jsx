import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('paciente'); // 'paciente' ou 'psicologo'

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    crp: '',
    telefone: '',
    codigoPsicologo: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async () => {
    try {
      const url = tipoUsuario === 'psicologo' ? '/psicologos/login' : '/pacientes/login';
      
      const response = await api.post(url, {
        email: formData.email,
        senha: formData.senha
      });

      const { id, nome } = response.data;
      
      localStorage.setItem('usuario_id', id);
      localStorage.setItem('usuario_nome', nome);
      localStorage.setItem('usuario_tipo', tipoUsuario);

      navigate('/app');
      window.location.reload();
      
    } catch (error) {
      alert('Erro no login! Verifique email e senha.');
    }
  };

  // --- NOVA LÓGICA DE CADASTRO ---
  const handleCadastro = async () => {
    try {
        if (tipoUsuario === 'psicologo') {
            // Cadastro de Psicólogo
            await api.post('/psicologos', {
                nome: formData.nome,
                email: formData.email,
                senha: formData.senha,
                crp: formData.crp
            });
            alert("Psicólogo cadastrado com sucesso! Faça login para continuar.");
        } else {
            // Cadastro de Paciente
            await api.post('/pacientes', {
                nome: formData.nome,
                email: formData.email,
                senha: formData.senha,
                telefone: formData.telefone,
                codigoPsicologo: formData.codigoPsicologo // Associação automática!
            });
            alert("Paciente cadastrado e vinculado com sucesso! Faça login.");
        }
        
        // Após cadastrar, joga o usuário para a tela de login
        setIsLogin(true); 

    } catch (error) {
        console.error(error);
        // O backend retorna erro se o código do psicólogo não existir
        alert("Erro ao cadastrar. Verifique os dados (especialmente o Código do Psicólogo se for paciente).");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{padding: '0', overflow: 'hidden'}}>
        
        {/* --- ABAS --- */}
        <div className="tabs-container">
            <button 
                className={`tab ${tipoUsuario === 'paciente' ? 'active' : ''}`}
                onClick={() => setTipoUsuario('paciente')}
            >
                Paciente
            </button>
            <button 
                className={`tab ${tipoUsuario === 'psicologo' ? 'active' : ''}`}
                onClick={() => setTipoUsuario('psicologo')}
            >
                Profissional
            </button>
        </div>

        <div style={{padding: '2rem'}}>
            <div className="logo-area">
            <h1>MindWell</h1>
            <p>
                {isLogin ? 'Acesse sua conta ' : 'Crie sua conta de '} 
                {tipoUsuario === 'psicologo' ? 'Profissional' : 'Paciente'}
            </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
            
            {/* Campos de Nome (Só no cadastro) */}
            {!isLogin && (
                <div className="input-group">
                    <label>Nome Completo</label>
                    <input name="nome" type="text" placeholder="Ex: João Silva" onChange={handleChange} />
                </div>
            )}
            
            {/* Campos Comuns (Email/Senha) */}
            <div className="input-group">
                <label>E-mail</label>
                <input name="email" type="email" placeholder="exemplo@email.com" onChange={handleChange} />
            </div>

            <div className="input-group">
                <label>Senha</label>
                <input name="senha" type="password" placeholder="••••••••" onChange={handleChange} />
            </div>

            {/* --- CAMPOS ESPECÍFICOS DE PSICÓLOGO --- */}
            {!isLogin && tipoUsuario === 'psicologo' && (
                <div className="input-group">
                    <label>Registro Profissional (CRP)</label>
                    <input name="crp" type="text" placeholder="Ex: 05/12345" onChange={handleChange} />
                </div>
            )}

            {/* --- CAMPOS ESPECÍFICOS DE PACIENTE --- */}
            {!isLogin && tipoUsuario === 'paciente' && (
                <>
                    <div className="input-group">
                        <label>Telefone</label>
                        <input name="telefone" type="text" placeholder="(XX) 99999-9999" onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label>Código do Psicólogo</label>
                        <input name="codigoPsicologo" type="text" placeholder="Cole o código fornecido pelo terapeuta" onChange={handleChange} />
                        <small style={{color: '#6b7280', fontSize: '0.8rem'}}>Obrigatório para vincular ao profissional.</small>
                    </div>
                </>
            )}

            <button className="btn-primary" type="button" onClick={isLogin ? handleLogin : handleCadastro}>
                {isLogin ? 'Entrar na Plataforma' : 'Finalizar Cadastro'}
            </button>
            </form>

            <p className="toggle-text">
            {isLogin ? 'Ainda não tem cadastro?' : 'Já possui uma conta?'}
            <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Crie agora' : 'Faça login'}
            </span>
            </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;