import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buscarJogadores } from '../services/api.js';
import StatusMensagem from '../components/StatusMensagem.jsx';

function Home() {
  const [jogadores, setJogadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarDados() {
      setCarregando(true);
      setErro(null);

      try {
        const dados = await buscarJogadores(controller.signal);
        setJogadores(Array.isArray(dados) ? dados : []);
      } catch (err) {
        // Ignora o erro quando a requisição é cancelada na desmontagem do componente
        if (err.name === 'AbortError') {
          return;
        }
        setErro(err.message || 'Erro ao buscar a lista de jogadores.');
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    // Limpeza do efeito: cancela a requisição pendente se o usuário sair da página
    return () => {
      controller.abort();
    };
  }, [tentativa]);

  function tentarNovamente() {
    setTentativa((valorAtual) => valorAtual + 1);
  }

  return (
    <section aria-labelledby="titulo-galeria">
      <div className="page-header">
        <h2 id="titulo-galeria" className="section-title">
          Ídolos históricos do Cruzeiro
        </h2>
        <p className="section-description">
          Este acervo reúne informações, estatísticas e títulos dos jogadores que marcaram época no
          Cruzeiro Esporte Clube desde a sua fundação em 1921.
        </p>
      </div>

      {carregando && <StatusMensagem tipo="carregando" />}

      {!carregando && erro && (
        <StatusMensagem
          tipo="erro"
          mensagem={erro}
          aoTentarNovamente={tentarNovamente}
        />
      )}

      {!carregando && !erro && jogadores.length === 0 && (
        <StatusMensagem tipo="vazio" />
      )}

      {!carregando && !erro && jogadores.length > 0 && (
        <ul className="lista-jogadores-simples">
          {jogadores.map((jogador) => (
            <li key={jogador.id} className="lista-jogadores-item">
              <div>
                <span className="lista-jogadores-nome">{jogador.apelido}</span>
                <span className="lista-jogadores-posicao">({jogador.posicao})</span>
              </div>
              <Link to={`/item/${jogador.id}`} className="inline-link">
                Ver detalhes
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Home;
