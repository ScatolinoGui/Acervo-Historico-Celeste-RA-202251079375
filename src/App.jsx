import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Detalhes from './pages/Detalhes.jsx';
import Sugerir from './pages/Sugerir.jsx';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-container">
          <Header />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/item/:id" element={<Detalhes />} />
              <Route path="/novo" element={<Sugerir />} />
              <Route
                path="*"
                element={
                  <section aria-labelledby="titulo-nao-encontrada">
                    <div className="page-header">
                      <h2 id="titulo-nao-encontrada" className="section-title">
                        Página não encontrada
                      </h2>
                      <p className="section-description">
                        O endereço informado não corresponde a nenhuma seção do acervo.
                      </p>
                    </div>
                    <Link to="/" className="back-link">
                      Voltar para a galeria
                    </Link>
                  </section>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
