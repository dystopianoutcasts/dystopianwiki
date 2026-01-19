import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { TOCItem } from '../types/wiki';

interface ArticleContextType {
  tocItems: TOCItem[];
  setTocItems: (items: TOCItem[]) => void;
  clearTocItems: () => void;
}

const ArticleContext = createContext<ArticleContextType | null>(null);

interface ArticleProviderProps {
  children: ReactNode;
}

export function ArticleProvider({ children }: ArticleProviderProps) {
  const [tocItems, setTocItemsState] = useState<TOCItem[]>([]);

  const setTocItems = useCallback((items: TOCItem[]) => {
    setTocItemsState(items);
  }, []);

  const clearTocItems = useCallback(() => {
    setTocItemsState([]);
  }, []);

  return (
    <ArticleContext.Provider value={{ tocItems, setTocItems, clearTocItems }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticleContext() {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error('useArticleContext must be used within an ArticleProvider');
  }
  return context;
}

export function useArticleTOC() {
  const context = useContext(ArticleContext);
  return context?.tocItems ?? [];
}
