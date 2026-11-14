import { useState, useEffect } from 'react';
import { buscarJogadores } from '../services/api.js';
import StatusMensagem from '../components/StatusMensagem.jsx';
import FiltroBusca from '../components/FiltroBusca.jsx';
import GaleriaGrid from '../components/GaleriaGrid.jsx';

function Home() {
  const [jogadores, setJogadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  const [busca, setBusca] = useState('');
  const [posicaoSelecionada, setPosicaoSelecionada] = useState('Todas');

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

  function limparFiltros() {
    setBusca('');
    setPosicaoSelecionada('Todas');
  }

  // Lista derivada: aplica busca por nome/apelido e filtro por posição sem alterar o array original
  const termoNormalizado = busca.trim().toLowerCase();

  const jogadoresFiltrados = jogadores.filter((jogador) => {
    const correspondePosicao =
      posicaoSelecionada === 'Todas' || jogador.posicao === posicaoSelecionada;

    const correspondeTexto =
      termoNormalizado === '' ||
      jogador.nome.toLowerCase().includes(termoNormalizado) ||
      jogador.apelido.toLowerCase().includes(termoNormalizado);

    return correspondePosicao && correspondeTexto;
  });

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
        <>
          <FiltroBusca
            busca={busca}
            aoMudarBusca={setBusca}
            posicaoSelecionada={posicaoSelecionada}
            aoMudarPosicao={setPosicaoSelecionada}
            totalExibido={jogadoresFiltrados.length}
            totalGeral={jogadores.length}
            aoLimparFiltros={limparFiltros}
          />

          {jogadoresFiltrados.length === 0 ? (
            <StatusMensagem
              tipo="vazio"
              mensagem="Nenhum jogador encontrado com os filtros selecionados."
              aoLimparFiltros={limparFiltros}
            />
          ) : (
            <GaleriaGrid jogadores={jogadoresFiltrados} />
          )}
        </>
      )}
    </section>
  );
}

export default Home;
