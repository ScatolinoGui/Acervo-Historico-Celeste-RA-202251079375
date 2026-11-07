import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

function Header() {
  const { tema, alternarTema } = useTheme();

  return (
    <header className="site-header">
      <div className="header-container">
        <h1 className="site-title">
          <Link to="/">Acervo Histórico Celeste</Link>
        </h1>

        <div className="header-actions">
          <nav aria-label="Navegação principal">
            <ul className="nav-list">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Galeria
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/novo"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Sugerir ídolo
                </NavLink>
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
