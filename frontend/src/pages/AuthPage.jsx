import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('paciente');

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
      alert('Erro no login! Verifique suas credenciais.');
    }
  };

  const handleCadastro = () => alert("Cadastro em breve!");

  return (
    <div className="auth-container">
      <div className="auth-card" style={{padding: '0', overflow: 'hidden'}}>
        
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
            <p>Acesso para {tipoUsuario === 'psicologo' ? 'Psicólogos' : 'Pacientes'}</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
            {!isLogin && <div className="input-group"><label>Nome</label><input name="nome" onChange={handleChange} /></div>}
            
            <div className="input-group">
                <label>E-mail</label>
                <input name="email" type="email" onChange={handleChange} />
            </div>

            <div className="input-group">
                <label>Senha</label>
                <input name="senha" type="password" onChange={handleChange} />
            </div>

            <button className="btn-primary" type="button" onClick={isLogin ? handleLogin : handleCadastro}>
                {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
            </form>

            <p className="toggle-text">
            <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Criar conta' : 'Voltar para login'}
            </span>
            </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;