import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useJogadores } from '../context/JogadoresContext.jsx';
import { GRUPOS_POSICOES, POSICOES_VALIDAS } from '../constants/posicoes.js';
import { buscarFotoJogador } from '../services/api.js';

const ESTADO_INICIAL = {
  nome: '',
  apelido: '',
  posicao: '',
  anoEstreia: '',
  periodo: '',
  jogos: '',
  gols: '',
  titulos: '',
  justificativa: '',
  emailIndicador: '',
  imagem: '',
};

const IMAGEM_PADRAO = '/img/padrao.svg';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MENSAGEM_SEM_FOTO =
  'Nenhuma imagem foi localizada automaticamente. Cole uma URL manualmente ou deixe o campo em branco para usar a imagem padrão do acervo.';

function validarFormulario(valores) {
  const erros = {};

  if (valores.nome.trim().length < 3) {
    erros.nome = 'Informe o nome completo com pelo menos 3 caracteres.';
  }

  if (!POSICOES_VALIDAS.includes(valores.posicao)) {
    erros.posicao = 'Selecione a posição do jogador.';
  }

  const anoTexto = valores.anoEstreia.trim();
  const anoNumero = Number(anoTexto);
  if (anoTexto === '') {
    erros.anoEstreia = 'Informe o ano de estreia pelo Cruzeiro.';
  } else if (!Number.isInteger(anoNumero) || anoNumero < 1921 || anoNumero > 2026) {
    erros.anoEstreia = 'O ano de estreia deve ficar entre 1921 e 2026.';
  }

  if (valores.periodo.trim() === '') {
    erros.periodo = 'Informe o período de atuação no clube (ex.: 1997 a 2001).';
  }

  const jogosTexto = valores.jogos.trim();
  if (jogosTexto !== '') {
    const jogosNumero = Number(jogosTexto);
    if (!Number.isInteger(jogosNumero) || jogosNumero < 0) {
      erros.jogos = 'O número de jogos deve ser um valor inteiro maior ou igual a zero.';
    }
  }

  const golsTexto = valores.gols.trim();
  if (golsTexto !== '') {
    const golsNumero = Number(golsTexto);
    if (!Number.isInteger(golsNumero) || golsNumero < 0) {
      erros.gols = 'O número de gols deve ser um valor inteiro maior ou igual a zero.';
    }
  }

  if (valores.justificativa.trim().length < 20) {
    erros.justificativa = 'Escreva uma justificativa com pelo menos 20 caracteres.';
  }

  const emailLimpo = valores.emailIndicador.trim();
  if (emailLimpo === '') {
    erros.emailIndicador = 'Informe seu e-mail.';
  } else if (!REGEX_EMAIL.test(emailLimpo)) {
    erros.emailIndicador = 'Informe um endereço de e-mail válido.';
  }

  const imagemLimpa = valores.imagem.trim();
  if (
    imagemLimpa !== '' &&
    !imagemLimpa.startsWith('/') &&
    !imagemLimpa.startsWith('http://') &&
    !imagemLimpa.startsWith('https://')
  ) {
    erros.imagem = 'Informe uma URL começando com http://, https:// ou /img/.';
  }

  return erros;
}

function criarResumo(texto) {
  if (texto.length <= 140) {
    return texto;
  }
  return `${texto.slice(0, 137).trimEnd()}...`;
}

// Chave usada para não repetir no envio uma busca que já falhou ou cuja foto foi removida
function criarChaveBusca(nome, apelido) {
  return `${nome.trim().toLowerCase()}|${apelido.trim().toLowerCase()}`;
}

function Sugerir() {
  const { adicionarJogador } = useJogadores();

  const [dados, setDados] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});
  const [jogadorCriado, setJogadorCriado] = useState(null);

  const [buscandoFoto, setBuscandoFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [avisoFoto, setAvisoFoto] = useState(null);
  const [fotoAutomatica, setFotoAutomatica] = useState(null);
  const [chaveSemBusca, setChaveSemBusca] = useState(null);

  const controladorFotoRef = useRef(null);

  // Cancela qualquer busca de foto pendente quando o usuário sai da página
  useEffect(() => {
    return () => {
      controladorFotoRef.current?.abort();
    };
  }, []);

  function iniciarControladorFoto() {
    controladorFotoRef.current?.abort();
    const controller = new AbortController();
    controladorFotoRef.current = controller;
    return controller;
  }

  function handleChange(evento) {
    const { name, value } = evento.target;

    setDados((atual) => ({
      ...atual,
      [name]: value,
    }));

    if (erros[name]) {
      setErros((errosAtuais) => {
        const atualizados = { ...errosAtuais };
        delete atualizados[name];
        return atualizados;
      });
    }
  }

  async function handleBuscarFoto() {
    const nome = dados.nome.trim();
    const apelido = dados.apelido.trim();

    if (nome === '' && apelido === '') {
      setAvisoFoto({
        tipo: 'erro',
        texto: 'Preencha o nome completo ou o apelido do jogador antes de buscar a foto.',
      });
      return;
    }

    const controller = iniciarControladorFoto();
    setBuscandoFoto(true);
    setAvisoFoto({ tipo: 'info', texto: 'Procurando foto do jogador...' });

    try {
      const urlFoto = await buscarFotoJogador(nome, apelido, controller.signal);

      if (urlFoto) {
        setDados((atual) => ({ ...atual, imagem: urlFoto }));
        setErros((errosAtuais) => {
          const atualizados = { ...errosAtuais };
          delete atualizados.imagem;
          return atualizados;
        });
        setFotoAutomatica(urlFoto);
        setAvisoFoto({ tipo: 'sucesso', texto: 'Foto encontrada e preenchida no campo acima.' });
      } else {
        setChaveSemBusca(criarChaveBusca(nome, apelido));
        setAvisoFoto({ tipo: 'info', texto: MENSAGEM_SEM_FOTO });
      }
    } catch (erro) {
      if (erro.name === 'AbortError') {
        return;
      }
      setAvisoFoto({ tipo: 'info', texto: MENSAGEM_SEM_FOTO });
    } finally {
      if (!controller.signal.aborted) {
        setBuscandoFoto(false);
      }
    }
  }

  function removerFoto() {
    setDados((atual) => ({ ...atual, imagem: '' }));
    setFotoAutomatica(null);
    setChaveSemBusca(criarChaveBusca(dados.nome, dados.apelido));
    setAvisoFoto({
      tipo: 'info',
      texto: 'Foto removida. Cole outra URL ou deixe o campo em branco para usar a imagem padrão do acervo.',
    });
  }

  function tratarFalhaPreview() {
    setDados((atual) => ({ ...atual, imagem: '' }));
    setFotoAutomatica(null);
    setChaveSemBusca(criarChaveBusca(dados.nome, dados.apelido));
    setAvisoFoto({
      tipo: 'info',
      texto: 'A foto encontrada não pôde ser carregada. Cole outra URL ou deixe o campo em branco para usar a imagem padrão.',
    });
  }

  async function handleSubmit(evento) {
    evento.preventDefault();

    if (enviando || buscandoFoto) {
      return;
    }

    const errosEncontrados = validarFormulario(dados);

    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados);
      setJogadorCriado(null);
      return;
    }

    const nomeLimpo = dados.nome.trim();
    const apelidoLimpo = dados.apelido.trim();
    let imagemFinal = dados.imagem.trim();

    // Campo de foto em branco: tenta uma busca automática antes de salvar
    if (imagemFinal === '' && criarChaveBusca(nomeLimpo, apelidoLimpo) !== chaveSemBusca) {
      const controller = iniciarControladorFoto();
      setEnviando(true);
      setAvisoFoto({ tipo: 'info', texto: 'Procurando foto do jogador antes de salvar...' });

      try {
        const urlFoto = await buscarFotoJogador(nomeLimpo, apelidoLimpo, controller.signal);
        if (urlFoto) {
          imagemFinal = urlFoto;
        }
      } catch (erro) {
        if (erro.name === 'AbortError') {
          return;
        }
      } finally {
        if (!controller.signal.aborted) {
          setEnviando(false);
        }
      }

      if (controller.signal.aborted) {
        return;
      }
    }

    const justificativaLimpa = dados.justificativa.trim();
    const listaTitulos = dados.titulos
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const novoJogador = adicionarJogador({
      nome: nomeLimpo,
      apelido: apelidoLimpo || nomeLimpo,
      posicao: dados.posicao,
      anoEstreia: Number(dados.anoEstreia),
      periodo: dados.periodo.trim(),
      jogos: dados.jogos.trim() === '' ? 0 : Number(dados.jogos),
      gols: dados.gols.trim() === '' ? 0 : Number(dados.gols),
      titulos: listaTitulos,
      resumo: criarResumo(justificativaLimpa),
      biografia: justificativaLimpa,
      imagem: imagemFinal || IMAGEM_PADRAO,
    });

    setDados(ESTADO_INICIAL);
    setErros({});
    setAvisoFoto(null);
    setFotoAutomatica(null);
    setChaveSemBusca(null);
    setJogadorCriado(novoJogador);
  }

  const totalCaracteresJustificativa = dados.justificativa.trim().length;
  const mostrarPreview = fotoAutomatica !== null && dados.imagem === fotoAutomatica;
  const rotuloJogador = dados.apelido.trim() || dados.nome.trim() || 'jogador sugerido';

  return (
    <section aria-labelledby="titulo-sugerir">
      <div className="page-header">
        <h2 id="titulo-sugerir" className="section-title">
          Sugira um ídolo para o acervo
        </h2>
        <p className="section-description">
          Preencha os dados de um jogador que marcou história no Cruzeiro para incluir a ficha dele
          na galeria.
        </p>
      </div>

      {jogadorCriado && (
        <div className="alerta-sucesso" role="status">
          <p className="alerta-sucesso-titulo">
            Jogador adicionado ao acervo com sucesso: {jogadorCriado.nome}.
          </p>
          <p>
            A nova ficha já aparece na galeria inicial e fica salva neste navegador.
          </p>
          <div className="alerta-sucesso-acoes">
            <Link to="/" className="btn-detalhes">
              Ver jogador na galeria
            </Link>
            <Link to={`/item/${jogadorCriado.id}`} className="back-link">
              Abrir ficha criada
            </Link>
          </div>
        </div>
      )}

      <form className="form-sugerir" onSubmit={handleSubmit} noValidate>
        <div className="form-linha">
          <div className="form-campo">
            <label htmlFor="campo-nome">Nome completo *</label>
            <input
              id="campo-nome"
              name="nome"
              type="text"
              value={dados.nome}
              onChange={handleChange}
              placeholder="Ex.: Alexsandro de Souza"
              aria-invalid={erros.nome ? 'true' : undefined}
              aria-describedby={erros.nome ? 'erro-nome' : undefined}
              required
            />
            {erros.nome && (
              <span id="erro-nome" className="campo-erro" role="alert">
                {erros.nome}
              </span>
            )}
          </div>

          <div className="form-campo">
            <label htmlFor="campo-apelido">Apelido (opcional)</label>
            <input
              id="campo-apelido"
              name="apelido"
              type="text"
              value={dados.apelido}
              onChange={handleChange}
              placeholder="Ex.: O Príncipe"
            />
          </div>
        </div>

        <div className="form-linha">
          <div className="form-campo">
            <label htmlFor="posicao">Posição *</label>
            <select
              id="posicao"
              name="posicao"
              value={dados.posicao}
              onChange={handleChange}
              aria-invalid={erros.posicao ? 'true' : undefined}
              aria-describedby={erros.posicao ? 'erro-posicao' : undefined}
              required
            >
              <option value="">Selecione uma posição</option>
              {GRUPOS_POSICOES.map((grupo) => (
                <optgroup key={grupo.rotulo} label={grupo.rotulo}>
                  {grupo.opcoes.map((posicao) => (
                    <option key={posicao} value={posicao}>
                      {posicao}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {erros.posicao && (
              <span id="erro-posicao" className="campo-erro" role="alert">
                {erros.posicao}
              </span>
            )}
          </div>

          <div className="form-campo">
            <label htmlFor="campo-ano-estreia">Ano de estreia *</label>
            <input
              id="campo-ano-estreia"
              name="anoEstreia"
              type="number"
              min="1921"
              max="2026"
              value={dados.anoEstreia}
              onChange={handleChange}
              placeholder="Ex.: 1997"
              aria-invalid={erros.anoEstreia ? 'true' : undefined}
              aria-describedby={erros.anoEstreia ? 'erro-ano-estreia' : undefined}
              required
            />
            {erros.anoEstreia && (
              <span id="erro-ano-estreia" className="campo-erro" role="alert">
                {erros.anoEstreia}
              </span>
            )}
          </div>
        </div>

        <div className="form-linha">
          <div className="form-campo">
            <label htmlFor="campo-periodo">Período no clube *</label>
            <input
              id="campo-periodo"
              name="periodo"
              type="text"
              value={dados.periodo}
              onChange={handleChange}
              placeholder="Ex.: 1997 a 2001"
              aria-invalid={erros.periodo ? 'true' : undefined}
              aria-describedby={erros.periodo ? 'erro-periodo' : undefined}
              required
            />
            {erros.periodo && (
              <span id="erro-periodo" className="campo-erro" role="alert">
                {erros.periodo}
              </span>
            )}
          </div>

          <div className="form-campo">
            <label htmlFor="campo-email">Seu e-mail *</label>
            <input
              id="campo-email"
              name="emailIndicador"
              type="email"
              value={dados.emailIndicador}
              onChange={handleChange}
              placeholder="Ex.: torcedor@exemplo.com"
              aria-invalid={erros.emailIndicador ? 'true' : undefined}
              aria-describedby={erros.emailIndicador ? 'erro-email' : undefined}
              required
            />
            {erros.emailIndicador && (
              <span id="erro-email" className="campo-erro" role="alert">
                {erros.emailIndicador}
              </span>
            )}
          </div>
        </div>

        <div className="form-linha">
          <div className="form-campo">
            <label htmlFor="campo-jogos">Jogos disputados (opcional)</label>
            <input
              id="campo-jogos"
              name="jogos"
              type="number"
              min="0"
              value={dados.jogos}
              onChange={handleChange}
              placeholder="Ex.: 121"
              aria-invalid={erros.jogos ? 'true' : undefined}
              aria-describedby={erros.jogos ? 'erro-jogos' : undefined}
            />
            {erros.jogos && (
              <span id="erro-jogos" className="campo-erro" role="alert">
                {erros.jogos}
              </span>
            )}
          </div>

          <div className="form-campo">
            <label htmlFor="campo-gols">Gols marcados (opcional)</label>
            <input
              id="campo-gols"
              name="gols"
              type="number"
              min="0"
              value={dados.gols}
              onChange={handleChange}
              placeholder="Ex.: 64"
              aria-invalid={erros.gols ? 'true' : undefined}
              aria-describedby={erros.gols ? 'erro-gols' : undefined}
            />
            {erros.gols && (
              <span id="erro-gols" className="campo-erro" role="alert">
                {erros.gols}
              </span>
            )}
          </div>
        </div>

        <div className="form-campo">
          <label htmlFor="campo-titulos">Títulos conquistados (opcional)</label>
          <input
            id="campo-titulos"
            name="titulos"
            type="text"
            value={dados.titulos}
            onChange={handleChange}
            placeholder="Separe por vírgulas. Ex.: Libertadores 1997, Copa do Brasil 2000"
          />
          <span className="campo-ajuda">
            Separe cada título com vírgula para gerar a lista na ficha do jogador.
          </span>
        </div>

        <div className="form-campo">
          <label htmlFor="campo-imagem">URL da foto (opcional)</label>
          <input
            id="campo-imagem"
            name="imagem"
            type="url"
            value={dados.imagem}
            onChange={handleChange}
            placeholder="Deixe em branco para usar a imagem padrão do acervo"
            aria-invalid={erros.imagem ? 'true' : undefined}
            aria-describedby={erros.imagem ? 'aviso-foto erro-imagem' : 'aviso-foto'}
          />
          {erros.imagem && (
            <span id="erro-imagem" className="campo-erro" role="alert">
              {erros.imagem}
            </span>
          )}

          <div className="campo-foto-acoes">
            <button
              type="button"
              className="btn-secundario"
              onClick={handleBuscarFoto}
              disabled={buscandoFoto || enviando}
            >
              {buscandoFoto ? 'Buscando foto...' : 'Buscar foto automaticamente'}
            </button>
          </div>

          <div id="aviso-foto" role="status" aria-live="polite">
            {avisoFoto && (
              <span className={`aviso-foto aviso-foto-${avisoFoto.tipo}`}>{avisoFoto.texto}</span>
            )}
          </div>

          {mostrarPreview && (
            <figure className="preview-foto-jogador">
              <img
                src={dados.imagem}
                alt={`Pré-visualização da foto de ${rotuloJogador}`}
                onError={tratarFalhaPreview}
              />
              <figcaption>
                <span className="campo-ajuda">Foto encontrada automaticamente.</span>
                <button type="button" className="btn-secundario" onClick={removerFoto}>
                  Remover foto
                </button>
              </figcaption>
            </figure>
          )}
        </div>

        <div className="form-campo">
          <label htmlFor="campo-justificativa">Justificativa histórica *</label>
          <textarea
            id="campo-justificativa"
            name="justificativa"
            rows="4"
            value={dados.justificativa}
            onChange={handleChange}
            placeholder="Descreva a passagem do jogador pelo Cruzeiro, conquistas e principais feitos."
            aria-invalid={erros.justificativa ? 'true' : undefined}
            aria-describedby={
              erros.justificativa
                ? 'ajuda-justificativa erro-justificativa'
                : 'ajuda-justificativa'
            }
            required
          />
          <span id="ajuda-justificativa" className="campo-ajuda">
            {totalCaracteresJustificativa} caracteres (mínimo de 20 caracteres).
          </span>
          {erros.justificativa && (
            <span id="erro-justificativa" className="campo-erro" role="alert">
              {erros.justificativa}
            </span>
          )}
        </div>

        <div className="form-acoes">
          <button type="submit" className="btn-enviar" disabled={enviando || buscandoFoto}>
            {enviando ? 'Salvando jogador...' : 'Cadastrar jogador no acervo'}
          </button>
          <Link to="/" className="back-link">
            Voltar para a galeria
          </Link>
        </div>
      </form>
    </section>
  );
}

export default Sugerir;
