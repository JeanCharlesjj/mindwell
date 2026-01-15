import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const usuarioTipo = localStorage.getItem('usuario_tipo');

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <aside className="sidebar">
            <h2 style={{color: 'var(--primary-color)'}}>MindWell</h2>
            
            {/* --- MENU COMUM (DASHBOARD) --- */}
            <div 
                className={`menu-item ${isActive('/app')}`} 
                onClick={() => navigate('/app')}
            >
                Início
            </div>

            {/* --- MENU DO PSICÓLOGO --- */}
            {usuarioTipo === 'psicologo' && (
                <>
                    <div 
                        className={`menu-item ${isActive('/consultas')}`} 
                        onClick={() => navigate('/consultas')}
                    >
                        Minha Agenda
                    </div>
                    <div 
                        className={`menu-item ${isActive('/pacientes')}`} 
                        onClick={() => navigate('/pacientes')}
                    >
                        Meus Pacientes
                    </div>
                </>
            )}

            {/* --- MENU DO PACIENTE --- */}
            {usuarioTipo === 'paciente' && (
                <>
                     <div 
                        className={`menu-item ${isActive('/consultas')}`} 
                        onClick={() => navigate('/consultas')}
                    >
                        Minhas Sessões
                    </div>
                    {/* Futuramente: Buscar Psicólogos */}
                </>
            )}

            <div className="menu-item-logout" onClick={handleLogout}>Sair</div>
        </aside>
    );
}

export default Sidebar;