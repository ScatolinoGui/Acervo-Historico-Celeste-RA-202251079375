import JogadorCard from './JogadorCard.jsx';

function GaleriaGrid({ jogadores }) {
  return (
    <div className="galeria-grid">
      {jogadores.map((jogador) => (
        <JogadorCard key={jogador.id} jogador={jogador} />
      ))}
    </div>
  );
}

export default GaleriaGrid;
