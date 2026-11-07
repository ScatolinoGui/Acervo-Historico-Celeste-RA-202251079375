import { Link } from 'react-router-dom';

function Home() {
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

      <div className="placeholder-box">
        <p>A galeria completa de jogadores será carregada nesta página.</p>
        <div className="placeholder-actions">
          <Link to="/item/1" className="inline-link">
            Ver exemplo de ficha individual (Tostão)
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
