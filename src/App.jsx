import { useState, useEffect } from 'react';

function App() {
  const [tema, setTema] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  function alternarTema() {
    setTema((temaAnterior) => (temaAnterior === 'light' ? 'dark' : 'light'));
  }

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="header-container">
          <h1 className="site-title">Acervo Histórico Celeste</h1>

          <div className="header-actions">
            <nav aria-label="Navegação principal">
              <ul className="nav-list">
                <li>
                  <a href="#inicio" className="nav-link active">
                    Início
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

      <main className="main-content">
        <section aria-labelledby="titulo-galeria">
          <div className="page-header">
            <h2 id="titulo-galeria" className="section-title">
              Ídolos históricos do Cruzeiro
            </h2>
            <p className="section-description">
              Este acervo reúne informações, estatísticas e títulos dos jogadores que marcaram época
              no Cruzeiro Esporte Clube desde a sua fundação em 1921.
            </p>
          </div>

          <div className="placeholder-box">
            <p>A lista de jogadores será carregada aqui na próxima etapa.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>&copy; 2026 Acervo Histórico Celeste</p>
      </footer>
    </div>
  );
}

export default App;
