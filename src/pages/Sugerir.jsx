import { Link } from 'react-router-dom';

function Sugerir() {
  return (
    <section aria-labelledby="titulo-sugerir">
      <div className="page-header">
        <h2 id="titulo-sugerir" className="section-title">
          Sugira um ídolo para o acervo
        </h2>
        <p className="section-description">
          Indique um jogador que marcou história no Cruzeiro para compor a lista do acervo.
        </p>
      </div>

      <div className="placeholder-box">
        <p>O formulário de cadastro de sugestões será exibido nesta página.</p>
      </div>

      <Link to="/" className="back-link">
        Voltar para a galeria
      </Link>
    </section>
  );
}

export default Sugerir;
