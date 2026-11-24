import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const CHAVE_TEMA = 'acervo_tema';

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      const temaSalvo = localStorage.getItem(CHAVE_TEMA);
      return temaSalvo === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      // Ignora falhas de escrita quando o armazenamento local estiver indisponível
    }
  }, [tema]);

  function alternarTema() {
    setTema((temaAnterior) => (temaAnterior === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const contexto = useContext(ThemeContext);

  if (!contexto) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider.');
  }

  return contexto;
}
