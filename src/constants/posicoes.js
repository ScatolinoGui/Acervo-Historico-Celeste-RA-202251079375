export const GRUPOS_POSICOES = [
  {
    rotulo: 'Gol',
    opcoes: ['Goleiro'],
  },
  {
    rotulo: 'Defesa',
    opcoes: [
      'Zagueiro',
      'Lateral-direito',
      'Lateral-esquerdo',
      'Ala-direito',
      'Ala-esquerdo',
    ],
  },
  {
    rotulo: 'Meio-campo',
    opcoes: ['Volante', 'Meio-campista', 'Meia-atacante'],
  },
  {
    rotulo: 'Ataque',
    opcoes: [
      'Ponta-direita',
      'Ponta-esquerda',
      'Segundo atacante',
      'Centroavante',
      'Atacante',
    ],
  },
];

export const POSICOES_VALIDAS = GRUPOS_POSICOES.flatMap((grupo) => grupo.opcoes);

export function ehPosicaoValida(posicao) {
  return POSICOES_VALIDAS.includes(String(posicao || '').trim());
}
