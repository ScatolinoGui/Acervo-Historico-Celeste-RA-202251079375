// Serviço para buscar a lista de jogadores a partir do arquivo estático em public/jogadores.json

export async function buscarJogadores(signal) {
  const response = await fetch('/jogadores.json', { signal });

  if (!response.ok) {
    throw new Error(`Erro ao carregar os dados dos jogadores (status ${response.status}).`);
  }

  const dados = await response.json();
  return dados;
}
