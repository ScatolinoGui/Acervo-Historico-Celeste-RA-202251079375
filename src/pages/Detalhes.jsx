import { Link, useParams } from 'react-router-dom';

function Detalhes() {
  const { id } = useParams();

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

      <div className="placeholder-box">
        <p>Exibindo dados referentes ao jogador de código {id}.</p>
      </div>

      <Link to="/" className="back-link">
        Voltar para a galeria
      </Link>
    </section>
  );
}

export default Detalhes;
