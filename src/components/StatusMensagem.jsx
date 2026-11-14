function StatusMensagem({ tipo, mensagem, aoTentarNovamente, aoLimparFiltros }) {
  if (tipo === 'carregando') {
    return (
      <div className="status-box" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="status-texto">
          {mensagem || 'Carregando jogadores do acervo...'}
        </p>
      </div>
    );
  }

  if (tipo === 'erro') {
    return (
      <div className="status-box status-erro" role="alert">
        <p className="status-texto">
          {mensagem || 'Não foi possível carregar os jogadores do acervo.'}
        </p>
        {aoTentarNovamente && (
          <button
            type="button"
            className="status-button"
            onClick={aoTentarNovamente}
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (tipo === 'vazio') {
    return (
      <div className="status-box" role="status" aria-live="polite">
        <p className="status-texto">
          {mensagem || 'Nenhum jogador encontrado.'}
        </p>
        {aoLimparFiltros && (
          <button
            type="button"
            className="status-button"
            onClick={aoLimparFiltros}
          >
            Limpar filtros
          </button>
        )}
      </div>
    );
  }

  return null;
}

export default StatusMensagem;
