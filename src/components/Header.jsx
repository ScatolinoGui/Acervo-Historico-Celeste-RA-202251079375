import { useTheme } from '../context/ThemeContext.jsx';

function Header() {
  const { tema, alternarTema } = useTheme();

  return (
    <header className="site-header">
      <div className="header-container">
        <h1 className="site-title">Acervo Histórico Celeste</h1>

        <div className="header-actions">
          <nav aria-label="Navegação principal">
            <ul className="nav-list">
              <li>
                <a href="#galeria" className="nav-link active">
                  Galeria
                </a>
              </li>
              <li>
                <a href="#sugerir" className="nav-link">
                  Sugerir ídolo
                </a>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            className="theme-button"
            onClick={alternarTema}
          >
            {tema === 'light' ? 'Tema escuro' : 'Tema claro'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
