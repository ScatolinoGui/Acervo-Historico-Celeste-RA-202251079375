import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const CHAVE_TEMA = 'acervo_tema';

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    const temaSalvo = localStorage.getItem(CHAVE_TEMA);
    return temaSalvo === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem(CHAVE_TEMA, tema);
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
