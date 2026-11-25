# Acervo Histórico Celeste

Aluno: Guilherme Pereira Scatolino
RA: 202251079375
Curso: Engenharia de Computação (Turma GNP0542 3001)
Disciplina: Programação Web

## Visão geral

O Acervo Histórico Celeste reúne fichas, estatísticas, biografias e títulos de jogadores que marcaram época no Cruzeiro Esporte Clube desde a fundação em 1921. Na Fase 1 da disciplina, construí este projeto apenas com documentos HTML e CSS estáticos separados. Nesta Fase 2, migrei toda a aplicação para uma Single Page Application (SPA) em React 19 com Vite, mantendo a mesma identidade visual limpa em azul e branco, mas agora com roteamento no cliente, consumo assíncrono de dados, filtragem em tempo real, estado compartilhado via Context API e persistência local no navegador.

## Deploy em produção

Aplicação publicada na Vercel: [Link da Vercel a ser preenchido após o deploy]

## Funcionalidades implementadas

- Galeria responsiva de jogadores carregada de `/jogadores.json` via `fetch` com `AbortController`, tratando explicitamente os 4 estados de interface na tela: `carregando` (com indicador visual), `erro` (com mensagem e botão para tentar novamente), `vazio` (quando a lista ou o filtro não encontram resultados, com opção de limpar os filtros) e `sucesso` (grade de cards em 1 coluna no celular, 2 no tablet e 4 no desktop).
- Busca textual em tempo real combinada com filtro por posição tática. A caixa de texto pesquisa simultaneamente pelo nome completo, apelido ou posição do atleta, enquanto o `<select>` agrupa as 14 posições reais do futebol em 4 setores (`Gol`, `Defesa`, `Meio-campo` e `Ataque`) por meio de `<optgroup>`, exibindo o contador atualizado de resultados.
- Página individual de detalhes na rota dinâmica `/item/:id`, lendo o identificador da URL com `useParams()`. Exibe retrato, posição, nome completo, apelido, estatísticas em lista de definição (`<dl>` com período, ano de estreia, jogos e gols), biografia e títulos conquistados. Quando o usuário acessa um código que não existe (como `/item/999`), a página mostra um aviso claro com link de retorno para a galeria, além de uma rota coringa (`*`) para endereços desconhecidos.
- Formulário controlado na rota `/novo` para sugerir novos jogadores ao acervo. Todos os campos são controlados via `useState` (`value` + `onChange`) e validados no `onSubmit` com `noValidate` (nome mínimo de 3 caracteres, posição válida, ano de estreia entre 1921 e 2026, período obrigatório, jogos e gols inteiros não negativos, formato de e-mail, URL opcional e justificativa histórica com contador ao vivo exigindo ao menos 20 caracteres).
- Busca automática de foto integrada ao formulário de sugestão. A partir do nome ou apelido preenchido, o botão consulta primeiro a API MediaWiki da Cruzeiropédia e, caso haja bloqueio ou ausência de imagem, consulta a Wikipédia em português (testando `<termo> Cruzeiro` e `<termo> futebolista`), exibindo pré-visualização com opção de remover a foto encontrada. Se o campo ficar em branco e nenhuma foto externa for localizada, o cadastro usa o placeholder local `/img/padrao.svg`.
- Persistência de sugestões e compartilhamento entre rotas via `JogadoresContext`. Novos cadastros recebem um ID numérico único acima dos 8 ídolos oficiais, são gravados na chave `acervo_jogadores_sugeridos` do `localStorage` e aparecem na hora tanto na galeria (`/`) quanto na rota `/item/:id`, sem recarregar o navegador.
- Alternância entre tema claro e tema escuro gerenciada pelo `ThemeContext`, aplicando o atributo `data-theme` no elemento `<html>` e salvando a escolha do usuário na chave `acervo_tema` do `localStorage`.
- Recursos de acessibilidade por teclado e leitores de tela: link "Pular para o conteúdo principal" (`.skip-link`) apontando para `<main id="conteudo-principal">`, contorno `:focus-visible` nítido nos dois temas, respeito à preferência `prefers-reduced-motion` na animação de carregamento, associação `<label htmlFor>` em todos os controles e atributos ARIA (`role="status"`, `role="alert"`, `aria-live="polite"`, `aria-invalid` e `aria-describedby`).

## Stack tecnológica

- React 19 (componentes funcionais em `.jsx` com `useState`, `useEffect`, `useContext`, `useMemo` e `useRef`)
- Vite 6 (servidor de desenvolvimento e empacotamento de produção)
- React Router DOM v7 (`BrowserRouter`, `Routes`, `Route`, `NavLink`, `Link` e `useParams`)
- Context API nativa do React (`ThemeContext` e `JogadoresContext`)
- CSS3 puro com Custom Properties (variáveis de tema), Flexbox, CSS Grid e Media Queries, sem bibliotecas externas de estilo

## Estrutura de pastas

```text
Acervo-Historico-Celeste-RA-202251079375/
├── public/
│   ├── img/                    # Fotos locais (.jpg), reservas (.svg) dos 8 ídolos e padrao.svg
│   └── jogadores.json          # Base oficial com os 8 jogadores históricos do Cruzeiro
├── src/
│   ├── components/
│   │   ├── FiltroBusca.jsx     # Barra de busca textual e filtro agrupado por posição
│   │   ├── Footer.jsx          # Rodapé institucional do trabalho
│   │   ├── GaleriaGrid.jsx     # Grade responsiva que mapeia os cards da galeria
│   │   ├── Header.jsx          # Cabeçalho com NavLink e botão de alternância de tema
│   │   ├── JogadorCard.jsx     # Card individual com resumo e tratamento de erro de imagem
│   │   └── StatusMensagem.jsx  # Componente para os estados carregando, erro e vazio
│   ├── constants/
│   │   └── posicoes.js         # Lista única das 14 posições táticas e validação
│   ├── context/
│   │   ├── JogadoresContext.jsx # Fetch inicial, mesclagem com localStorage e cadastro
│   │   └── ThemeContext.jsx    # Controle global e persistência do tema claro/escuro
│   ├── pages/
│   │   ├── Detalhes.jsx        # Ficha completa do jogador na rota /item/:id
│   │   ├── Home.jsx            # Página inicial com filtros combinados e galeria
│   │   └── Sugerir.jsx         # Formulário controlado e busca de foto na rota /novo
│   ├── services/
│   │   └── api.js              # Funções buscarJogadores e buscarFotoJogador
│   ├── styles/
│   │   └── global.css          # Variáveis de tema, layout responsivo e acessibilidade
│   ├── App.jsx                 # Provedores globais, skip-link e definição de rotas
│   └── main.jsx                # Montagem da árvore React na div #root
├── index.html                  # Documento HTML base da SPA
├── package.json                # Scripts e dependências do projeto
├── vercel.json                 # Regra de rewrite para rotas da SPA em produção
└── vite.config.js              # Configuração do Vite com plugin React
```

## Como executar localmente

Pré-requisito: Node.js (versão 18 ou superior) instalado na máquina.

1. Clone o repositório e acesse a pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd Acervo-Historico-Celeste-RA-202251079375
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento do Vite:

```bash
npm run dev
```

O terminal exibirá o endereço local (normalmente `http://localhost:5173`).

4. Para gerar e testar a versão otimizada de produção localmente:

```bash
npm run build
npm run preview
```

## Auditoria Lighthouse

Notas obtidas na versão de produção após o deploy na Vercel:

| Categoria | Nota (Fase 2) |
| :--- | :--- |
| Performance | `[A preencher após o deploy]` |
| Acessibilidade | `[A preencher após o deploy]` |
| Melhores práticas | `[A preencher após o deploy]` |
| SEO | `[A preencher após o deploy]` |

## Dificuldades enfrentadas no desenvolvimento

A transição da Fase 1 estática para o React trouxe vários problemas práticos que só apareceram conforme fui integrando as rotas, o armazenamento local e as chamadas externas.

O primeiro tropeço foi no ciclo do `useEffect` com `AbortController` rodando dentro do `<StrictMode>` do React 19. No ambiente de desenvolvimento, o React monta, desmonta e monta o componente de novo de propósito para testar a função de limpeza. Na minha primeira tentativa, o `controller.abort()` disparado nessa desmontagem caía direto no `catch`, que gravava o `AbortError` como se fosse uma falha real de rede, enquanto o `finally` desligava o `carregando` antes da segunda requisição terminar. Resolvi isso checando `if (err.name === 'AbortError') return;` no `catch` e condicionando o `setCarregando(false)` a `!controller.signal.aborted`. Mais adiante, percebi também que fazer o `fetch` separado em `Home.jsx` e `Detalhes.jsx` impedia que um jogador recém-criado em `/novo` aparecesse nas outras páginas, então movi toda essa lógica para o `JogadoresContext.jsx`.

Outro ponto trabalhoso foi a busca automática de fotos para jogadores sugeridos em `src/services/api.js`. Eu queria puxar primeiro da Cruzeiropédia e usar a Wikipédia em português como reserva, ambas baseadas em MediaWiki com o parâmetro `origin=*` na URL. Na prática, um domínio externo pode recusar CORS no navegador ou demorar demais para responder. Para não travar o formulário nem quebrar o envio, criei a função `buscarJsonComTempoLimite` com um `AbortController` interno de 6 segundos ligado ao `signal` externo do componente (guardado em um `useRef` na página `Sugerir.jsx`, para cancelar buscas antigas se o usuário clicar duas vezes ou sair da rota). Também precisei filtrar resultados que vinham de arquivos `.svg` convertidos em miniatura, porque a Wikipédia às vezes devolvia o escudo do clube ou a bandeira do Brasil em vez do rosto do jogador. No formulário, criei ainda o controle `chaveSemBusca`: sem ele, quando o usuário clicava em "Remover foto" e enviava o cadastro com o campo em branco, o `onSubmit` buscava tudo de novo e recolocava justamente a foto que tinha acabado de ser descartada.

Na metade do projeto, notei uma inconsistência nos dados: eu tinha começado com apenas 4 categorias genéricas de posição (`Goleiro`, `Defensor`, `Meio-campo` e `Atacante`). Isso deixava o Sorín rotulado como "Defensor" em vez de lateral-esquerdo e o Piazza como "Meio-campo" em vez de volante, além de espalhar arrays fixos em arquivos diferentes. Criei `src/constants/posicoes.js` como fonte única da verdade com 14 posições reais divididas em 4 `<optgroup>`, atualizei o `public/jogadores.json` e ajustei a leitura do `localStorage` no `JogadoresContext`: se houvesse algum jogador salvo anteriormente pelo navegador com uma posição antiga como `"Defensor"`, ele ficaria invisível nos filtros novos, então adicionei uma validação com `ehPosicaoValida` que limpa registros legados automaticamente ao carregar.

Nas imagens e no CSS responsivo, enfrentei dois detalhes visuais chatos. Primeiro, no `onError` das tags `<img>`, trocar `.jpg` por `.svg` ou por `/img/padrao.svg` podia gerar loop infinito caso o arquivo substituto também falhasse; resolvi marcando `imagem.dataset.fallbackAplicado = 'true'` na primeira tentativa. Segundo, quando coloquei as 8 fotos reais `.jpg` em `public/img/`, o `object-fit: cover` padrão centralizado cortava a testa e o cabelo de retratos fechados como os de Dirceu Lopes, Dida e Sorín nos cards de `220px` de altura, o que corrigi aplicando `object-position: center top`. Por fim, ao testar a largura de `360px` no DevTools, badges longas como `Lateral-esquerdo` e `Segundo atacante` e a grade de estatísticas da ficha empurravam a largura da tela e geravam barra de rolagem horizontal; troquei as colunas dos grids de `1fr` para `minmax(0, 1fr)` e apliquei `min-width: 0` e `overflow-wrap: break-word` nos containers internos até zerar qualquer estouro lateral.

## Créditos das imagens

As fotografias históricas dos 8 jogadores em `public/img/` e as imagens consultadas dinamicamente via API provêm de acervos públicos de referência esportiva e enciclopédica (Cruzeiropédia e Wikipédia/Wikimedia Commons). Todo o material visual é utilizado neste repositório exclusivamente para fins acadêmicos e sem qualquer intuito comercial, como parte da avaliação da disciplina de Programação Web.

## Uso de inteligência artificial

Durante o desenvolvimento desta Fase 2, utilizei um assistente de IA como ferramenta de apoio de estudo, consulta de sintaxe e depuração de bugs.

Na parte técnica, recorri à IA principalmente para entender como organizar o cancelamento de requisições com `AbortController` sem conflitar com a dupla execução do `<StrictMode>` no React 19, estruturar os provedores `ThemeContext` e `JogadoresContext` mesclando dados estáticos do JSON com o `localStorage` sem duplicar IDs, montar a configuração de rotas do React Router v7 (junto com a regra de rewrite do `vercel.json` para evitar erro 404 ao atualizar `/item/:id` ou `/novo`), ligar os atributos de acessibilidade (`aria-invalid`, `aria-describedby` e `role="alert"`) na validação controlada do formulário e desenhar o encadeamento de tentativas com timeout e parâmetro `origin=*` na API do MediaWiki para buscar fotos automaticamente. Ela também ajudou a diagnosticar por que filhos de CSS Grid com `1fr` estouravam a tela de `360px` quando recebiam palavras longas, apontando o uso de `minmax(0, 1fr)` e `min-width: 0`.

Todo o código sugerido passou por revisão manual, ajustes e descartes meus. Logo no começo da migração para React, descartei uma primeira versão de interface gerada pela IA que tinha aparência artificial, cheia de selos decorativos arredondados, emojis nos botões, números gigantes de marca d'água no fundo dos cards e textos falando sobre "SPA" e "rotas" na própria tela do usuário. Refiz o estilo em `global.css` para preservar o visual sóbrio e direto que eu já tinha estabelecido na Fase 1. Também revisei os dados históricos e as posições reais dos 8 jogadores em `jogadores.json`, ajustei o enquadramento das fotos locais e testei manualmente cada rota, filtro, validação de formulário, navegação por tecla `Tab` e comportamento do `localStorage` no navegador antes de fechar os commits.
