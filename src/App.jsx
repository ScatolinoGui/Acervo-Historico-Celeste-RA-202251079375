import { ThemeProvider } from './context/ThemeContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <ThemeProvider>
      <div className="app-container">
        <Header />

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

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
