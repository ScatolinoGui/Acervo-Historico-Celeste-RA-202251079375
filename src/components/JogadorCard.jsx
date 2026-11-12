import { Link } from 'react-router-dom';

function JogadorCard({ jogador }) {
  // Se a foto .jpg não existir em public/img, usa a versão .svg da mesma pasta
  function usarImagemReserva(evento) {
    const imagem = evento.currentTarget;
    if (imagem.src.endsWith('.jpg')) {
      imagem.src = imagem.src.replace(/\.jpg$/, '.svg');
    }
  }

  return (
    <article className="card-jogador">
      <img
        src={jogador.imagem}
        alt={`Foto de ${jogador.apelido}, ${jogador.posicao.toLowerCase()} do Cruzeiro`}
        loading="lazy"
        onError={usarImagemReserva}
      />

      <div className="card-jogador-info">
        <span className="card-jogador-posicao">{jogador.posicao}</span>
        <h3 className="card-jogador-nome">{jogador.nome}</h3>
        <p className="card-jogador-apelido">{jogador.apelido}</p>
        <p className="card-jogador-periodo">No clube: {jogador.periodo}</p>
        <p className="card-jogador-resumo">{jogador.resumo}</p>

        <Link to={`/item/${jogador.id}`} className="btn-detalhes">
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}

export default JogadorCard;
