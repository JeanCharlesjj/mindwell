import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  // Vamos focar no login de psicólogo por enquanto
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    crp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      // 1. Envia email e senha para o Java
      const response = await api.post('/psicologos/login', {
        email: formData.email,
        senha: formData.senha
      });

      // 2. O Java devolveu o UUID!
      const idUsuario = response.data;
      
      // 3. Guarda no navegador (como se fosse um cookie)
      localStorage.setItem('usuario_id', idUsuario);
      localStorage.setItem('usuario_tipo', 'psicologo');

      // 4. Vai para o Dashboard
      navigate('/app'); // Se você configurou a rota como /app no App.jsx
      // Se não configurou rota /app, use navigate(0) para recarregar se o App.jsx mostra Dashboard direto
      window.location.reload(); // Força recarregar para o App.jsx pegar o ID novo
      
    } catch (error) {
      alert('Erro no login! Verifique email e senha.');
      console.error(error);
    }
  };

  // Função simples de cadastro (só para não quebrar o botão)
  const handleCadastro = async () => {
      try {
          await api.post('/psicologos', {
              nome: formData.nome,
              email: formData.email,
              senha: formData.senha,
              crp: formData.crp
          });
          alert("Cadastrado com sucesso! Faça login.");
          setIsLogin(true); // Volta para tela de login
      } catch (error) {
          alert("Erro ao cadastrar.");
      }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-area">
          <h1>MindWell</h1>
          <p>Cuide da sua mente, onde estiver.</p>
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#1f2937' }}>
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta profissional'}
        </h2>

        <form onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
             <div className="input-group">
                <label>Nome Completo</label>
                <input name="nome" type="text" placeholder="Ex: João Silva" onChange={handleChange} />
             </div>
          )}
          
          <div className="input-group">
            <label>E-mail</label>
            <input name="email" type="email" placeholder="exemplo@email.com" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input name="senha" type="password" placeholder="••••••••" onChange={handleChange} />
          </div>
          
          {!isLogin && (
             <div className="input-group">
               <label>Registro Profissional (CRP)</label>
               <input name="crp" type="text" placeholder="Ex: 05/12345" onChange={handleChange} />
             </div>
          )}

          <button className="btn-primary" type="button" onClick={isLogin ? handleLogin : handleCadastro}>
            {isLogin ? 'Entrar na Plataforma' : 'Cadastrar-se'}
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
  );
}

export default AuthPage;