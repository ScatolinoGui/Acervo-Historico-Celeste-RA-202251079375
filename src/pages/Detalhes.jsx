import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buscarJogadores } from '../services/api.js';
import StatusMensagem from '../components/StatusMensagem.jsx';

function Detalhes() {
  const { id } = useParams();

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
        if (err.name === 'AbortError') {
          return;
        }
        setErro(err.message || 'Erro ao buscar os dados do jogador.');
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      controller.abort();
    };
  }, [tentativa]);

  function tentarNovamente() {
    setTentativa((valorAtual) => valorAtual + 1);
  }

  function usarImagemReserva(evento) {
    const imagem = evento.currentTarget;
    if (imagem.src.endsWith('.jpg')) {
      imagem.src = imagem.src.replace(/\.jpg$/, '.svg');
    }
  }

  const jogador = jogadores.find((item) => String(item.id) === String(id));

  return (
    <section aria-labelledby="titulo-detalhes">
      <div className="page-header">
        <h2 id="titulo-detalhes" className="section-title">
          Ficha do jogador
        </h2>
        <p className="section-description">
          Consulta detalhada de carreira, jogos disputados, gols e títulos pelo Cruzeiro.
        </p>
      </div>

      {carregando && (
        <StatusMensagem
          tipo="carregando"
          mensagem="Carregando ficha do jogador..."
        />
      )}

      {!carregando && erro && (
        <StatusMensagem
          tipo="erro"
          mensagem={erro}
          aoTentarNovamente={tentarNovamente}
        />
      )}

      {!carregando && !erro && !jogador && (
        <div className="detalhes-nao-encontrado">
          <StatusMensagem
            tipo="vazio"
            mensagem={`Nenhum jogador encontrado com o código ${id}.`}
          />
          <Link to="/" className="back-link">
            Voltar para a galeria
          </Link>
        </div>
      )}

      {!carregando && !erro && jogador && (
        <article className="detalhes-jogador">
          <div className="detalhes-midia">
            <img
              src={jogador.imagem}
              alt={`Foto de ${jogador.apelido}, ${jogador.posicao.toLowerCase()} do Cruzeiro`}
              onError={usarImagemReserva}
            />
          </div>

          <div className="detalhes-conteudo">
            <span className="card-jogador-posicao">{jogador.posicao}</span>
            <h3 className="detalhes-nome">{jogador.nome}</h3>
            <p className="detalhes-apelido">Conhecido como: {jogador.apelido}</p>

            <dl className="detalhes-estatisticas">
              <div className="estatistica-item">
                <dt>Período no clube</dt>
                <dd>{jogador.periodo}</dd>
              </div>
              <div className="estatistica-item">
                <dt>Ano de estreia</dt>
                <dd>{jogador.anoEstreia}</dd>
              </div>
              <div className="estatistica-item">
                <dt>Jogos disputados</dt>
                <dd>{jogador.jogos}</dd>
              </div>
              <div className="estatistica-item">
                <dt>Gols marcados</dt>
                <dd>{jogador.gols}</dd>
              </div>
            </dl>

            <div className="detalhes-bloco">
              <h4>Biografia no clube</h4>
              <p>{jogador.biografia}</p>
            </div>

            {Array.isArray(jogador.titulos) && jogador.titulos.length > 0 && (
              <div className="detalhes-bloco">
                <h4>Títulos conquistados</h4>
                <ul className="detalhes-titulos">
                  {jogador.titulos.map((titulo) => (
                    <li key={titulo}>{titulo}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="detalhes-acoes">
              <Link to="/" className="back-link">
                Voltar para a galeria
              </Link>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

export default Detalhes;
