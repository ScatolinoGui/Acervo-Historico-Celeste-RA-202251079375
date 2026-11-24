// Serviços de acesso a dados: lista de jogadores (arquivo local) e busca de fotos em wikis públicas

export async function buscarJogadores(signal) {
  const response = await fetch('/jogadores.json', { signal });

  if (!response.ok) {
    throw new Error(`Erro ao carregar os dados dos jogadores (status ${response.status}).`);
  }

  const dados = await response.json();
  return dados;
}

const TEMPO_LIMITE_FOTO_MS = 6000;
const URL_CRUZEIROPEDIA = 'https://cruzeiropedia.org/api.php';
const URL_WIKIPEDIA = 'https://pt.wikipedia.org/w/api.php';

// origin=* libera a resposta da API do MediaWiki para chamadas anônimas feitas pelo navegador (CORS)
function montarUrlMediaWiki(base, termo, incluirOriginal) {
  const propriedades = incluirOriginal ? 'thumbnail|original' : 'thumbnail';
  return (
    `${base}?action=query&generator=search&gsrsearch=${encodeURIComponent(termo)}` +
    `&gsrlimit=3&prop=pageimages&piprop=${propriedades}&pithumbsize=600&format=json&origin=*`
  );
}

// Faz o fetch com tempo limite próprio, sem perder o cancelamento vindo do componente
async function buscarJsonComTempoLimite(url, signalExterno) {
  if (signalExterno?.aborted) {
    throw new DOMException('Busca cancelada.', 'AbortError');
  }

  const controller = new AbortController();
  const cancelarPorFora = () => controller.abort();
  signalExterno?.addEventListener('abort', cancelarPorFora, { once: true });
  const temporizador = setTimeout(() => controller.abort(), TEMPO_LIMITE_FOTO_MS);

  try {
    const resposta = await fetch(url, { signal: controller.signal });
    if (!resposta.ok) {
      return null;
    }
    return await resposta.json();
  } catch (erro) {
    // Cancelamento pedido pelo componente: repassa o AbortError para quem chamou
    if (signalExterno?.aborted) {
      throw erro;
    }
    // Tempo esgotado, bloqueio de CORS ou falha de rede: segue para a próxima fonte
    return null;
  } finally {
    clearTimeout(temporizador);
    signalExterno?.removeEventListener('abort', cancelarPorFora);
  }
}

// Lê a resposta do MediaWiki e devolve a primeira foto em .png, .jpg ou .webp
function extrairImagemMediaWiki(dados) {
  const paginas = dados?.query?.pages;
  if (!paginas) {
    return null;
  }

  const listaOrdenada = Object.values(paginas).sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0)
  );

  for (const pagina of listaOrdenada) {
    const url = pagina.thumbnail?.source || pagina.original?.source;
    if (!url) {
      continue;
    }

    // Descarta escudos, bandeiras e mapas, que costumam vir de arquivos .svg convertidos
    if (/\.svg/i.test(url)) {
      continue;
    }

    if (/\.(png|jpe?g|webp)(\?|$)/i.test(url)) {
      return url;
    }
  }

  return null;
}

export async function buscarFotoJogador(nome, apelido, signal) {
  const termos = [
    ...new Set(
      [nome, apelido]
        .map((texto) => String(texto || '').trim())
        .filter((texto) => texto.length >= 2)
    ),
  ];

  if (termos.length === 0) {
    return null;
  }

  // Ordem das consultas: Cruzeiropédia, Wikipédia com "Cruzeiro" e Wikipédia com "futebolista"
  const consultas = [
    ...termos.map((termo) => montarUrlMediaWiki(URL_CRUZEIROPEDIA, termo, true)),
    ...termos.map((termo) => montarUrlMediaWiki(URL_WIKIPEDIA, `${termo} Cruzeiro`, false)),
    ...termos.map((termo) => montarUrlMediaWiki(URL_WIKIPEDIA, `${termo} futebolista`, false)),
  ];

  for (const url of consultas) {
    const dados = await buscarJsonComTempoLimite(url, signal);
    const imagem = extrairImagemMediaWiki(dados);
    if (imagem) {
      return imagem;
    }
  }

  return null;
}
