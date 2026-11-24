import { GRUPOS_POSICOES } from '../constants/posicoes.js';

function FiltroBusca({
  busca,
  aoMudarBusca,
  posicaoSelecionada,
  aoMudarPosicao,
  totalExibido,
  totalGeral,
  aoLimparFiltros,
}) {
  const temFiltroAtivo = busca.trim() !== '' || posicaoSelecionada !== 'Todas';

  return (
    <div className="filtro-busca">
      <div className="filtro-controles">
        <div className="filtro-campo">
          <label htmlFor="campo-busca">Buscar por nome, apelido ou posição</label>
          <input
            id="campo-busca"
            type="search"
            value={busca}
            onChange={(evento) => aoMudarBusca(evento.target.value)}
            placeholder="Ex: Tostão, Fábio, lateral, volante..."
          />
        </div>

        <div className="filtro-campo">
          <label htmlFor="filtro-posicao">Filtrar por posição</label>
          <select
            id="filtro-posicao"
            value={posicaoSelecionada}
            onChange={(evento) => aoMudarPosicao(evento.target.value)}
          >
            <option value="Todas">Todas</option>
            {GRUPOS_POSICOES.map((grupo) => (
              <optgroup key={grupo.rotulo} label={grupo.rotulo}>
                {grupo.opcoes.map((posicao) => (
                  <option key={posicao} value={posicao}>
                    {posicao}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="filtro-resumo">
        <p className="filtro-contador" aria-live="polite">
          Mostrando {totalExibido} de {totalGeral} jogadores
        </p>

        {temFiltroAtivo && (
          <button
            type="button"
            className="btn-limpar-filtros"
            onClick={aoLimparFiltros}
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

export default FiltroBusca;
