import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { buscarJogadores } from '../services/api.js';
import { ehPosicaoValida } from '../constants/posicoes.js';

const JogadoresContext = createContext(null);

const CHAVE_SUGERIDOS = 'acervo_jogadores_sugeridos';

function escaparTextoSvg(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function criarImagemPadrao(rotulo) {
  const textoSeguro = escaparTextoSvg((rotulo || 'Cruzeiro').slice(0, 22));
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
    '<rect width="400" height="400" fill="#003399" />',
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="30" font-weight="700">${textoSeguro}</text>`,
    '</svg>',
  ].join('');

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function salvarJogadoresSugeridos(lista) {
  try {
    if (lista.length === 0) {
      localStorage.removeItem(CHAVE_SUGERIDOS);
      return;
    }
    localStorage.setItem(CHAVE_SUGERIDOS, JSON.stringify(lista));
  } catch {
    // Ignora falhas de escrita quando o armazenamento local estiver indisponível
  }
}

function lerJogadoresSugeridos() {
  try {
    const salvo = localStorage.getItem(CHAVE_SUGERIDOS);
    if (!salvo) {
      return [];
    }

    const dados = JSON.parse(salvo);
    if (!Array.isArray(dados)) {
      localStorage.removeItem(CHAVE_SUGERIDOS);
      return [];
    }

    const validos = dados
      .filter(
        (item) =>
          item &&
          typeof item === 'object' &&
          item.id != null &&
          typeof item.nome === 'string' &&
          item.nome.trim().length > 0 &&
          ehPosicaoValida(item.posicao)
      )
      .map((item) => {
        const nomeLimpo = item.nome.trim();
        const apelidoLimpo = String(item.apelido || '').trim() || nomeLimpo;
        const imagemInformada = String(item.imagem || '').trim();
        const anoEstreiaNumero = Number(item.anoEstreia);
        const jogosNumero = Number(item.jogos);
        const golsNumero = Number(item.gols);

        return {
          id: item.id,
          nome: nomeLimpo,
          apelido: apelidoLimpo,
          posicao: String(item.posicao).trim(),
          periodo: String(item.periodo || '').trim(),
          anoEstreia: Number.isFinite(anoEstreiaNumero) ? anoEstreiaNumero : 0,
          jogos: Number.isFinite(jogosNumero) ? jogosNumero : 0,
          gols: Number.isFinite(golsNumero) ? golsNumero : 0,
          titulos: normalizarTitulos(item.titulos),
          resumo: String(item.resumo || '').trim(),
          biografia: String(item.biografia || '').trim(),
          imagem: imagemInformada || criarImagemPadrao(apelidoLimpo),
          sugerido: true,
        };
      });

    // Remove do localStorage registros antigos com posições fora da lista atual
    if (validos.length !== dados.length) {
      salvarJogadoresSugeridos(validos);
    }

    return validos;
  } catch {
    try {
      localStorage.removeItem(CHAVE_SUGERIDOS);
    } catch {
      // Ignora erro caso o navegador bloqueie o armazenamento local
    }
    return [];
  }
}

function normalizarTitulos(titulos) {
  if (Array.isArray(titulos)) {
    return titulos
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof titulos === 'string') {
    return titulos
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

export function JogadoresProvider({ children }) {
  const [jogadoresBase, setJogadoresBase] = useState([]);
  const [jogadoresSugeridos, setJogadoresSugeridos] = useState(lerJogadoresSugeridos);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarDados() {
      setCarregando(true);
      setErro(null);

      try {
        const dados = await buscarJogadores(controller.signal);
        setJogadoresBase(Array.isArray(dados) ? dados : []);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        setErro(err.message || 'Erro ao buscar a lista de jogadores.');
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      controller.abort();
    };
  }, [tentativa]);

  const jogadores = useMemo(() => {
    const idsPresentes = new Set();
    const listaMesclada = [];

    for (const item of jogadoresBase) {
      const chaveId = String(item.id);
      if (!idsPresentes.has(chaveId)) {
        idsPresentes.add(chaveId);
        listaMesclada.push(item);
      }
    }

    for (const item of jogadoresSugeridos) {
      const chaveId = String(item.id);
      if (!idsPresentes.has(chaveId)) {
        idsPresentes.add(chaveId);
        listaMesclada.push(item);
      }
    }

    return listaMesclada;
  }, [jogadoresBase, jogadoresSugeridos]);

  function tentarNovamente() {
    setTentativa((valorAtual) => valorAtual + 1);
  }

  function adicionarJogador(dadosNovoJogador) {
    const idsNumericos = jogadores
      .map((item) => Number(item.id))
      .filter((valor) => Number.isFinite(valor));
    const maiorId = idsNumericos.length > 0 ? Math.max(8, ...idsNumericos) : 8;
    const novoId = maiorId + 1;

    const nomeLimpo = String(dadosNovoJogador.nome || '').trim();
    const apelidoLimpo = String(dadosNovoJogador.apelido || '').trim() || nomeLimpo;
    const posicaoInformada = String(dadosNovoJogador.posicao || '').trim();
    const imagemInformada = String(dadosNovoJogador.imagem || '').trim();
    const anoEstreiaNumero = Number(dadosNovoJogador.anoEstreia);
    const jogosNumero = Number(dadosNovoJogador.jogos);
    const golsNumero = Number(dadosNovoJogador.gols);

    const novoJogador = {
      id: novoId,
      nome: nomeLimpo,
      apelido: apelidoLimpo,
      posicao: ehPosicaoValida(posicaoInformada) ? posicaoInformada : 'Atacante',
      periodo: String(dadosNovoJogador.periodo || '').trim(),
      anoEstreia: Number.isFinite(anoEstreiaNumero) ? anoEstreiaNumero : 0,
      jogos: Number.isFinite(jogosNumero) ? jogosNumero : 0,
      gols: Number.isFinite(golsNumero) ? golsNumero : 0,
      titulos: normalizarTitulos(dadosNovoJogador.titulos),
      resumo: String(dadosNovoJogador.resumo || '').trim(),
      biografia: String(dadosNovoJogador.biografia || '').trim(),
      imagem: imagemInformada || criarImagemPadrao(apelidoLimpo),
      sugerido: true,
    };

    const listaAtualizada = [...jogadoresSugeridos, novoJogador];
    setJogadoresSugeridos(listaAtualizada);
    salvarJogadoresSugeridos(listaAtualizada);

    return novoJogador;
  }

  function removerJogadorSugerido(id) {
    const listaAtualizada = jogadoresSugeridos.filter(
      (item) => String(item.id) !== String(id)
    );

    if (listaAtualizada.length === jogadoresSugeridos.length) {
      return false;
    }

    setJogadoresSugeridos(listaAtualizada);
    salvarJogadoresSugeridos(listaAtualizada);
    return true;
  }

  return (
    <JogadoresContext.Provider
      value={{
        jogadores,
        carregando,
        erro,
        tentarNovamente,
        adicionarJogador,
        removerJogadorSugerido,
      }}
    >
      {children}
    </JogadoresContext.Provider>
  );
}

export function useJogadores() {
  const contexto = useContext(JogadoresContext);

  if (!contexto) {
    throw new Error('useJogadores deve ser usado dentro de um JogadoresProvider.');
  }

  return contexto;
}
