import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { SurveyDataset } from '../types';
import { SURVEY_DATA } from '../constants';
import { safeClone } from '../utils/safeClone';

console.log('[DEBUG] AppContext.tsx loading...');
console.log('[DEBUG] SURVEY_DATA:', SURVEY_DATA);

const THEME_STORAGE_KEY = 'hyper-analyse-theme';
type ThemeMode = 'light' | 'dark';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  surveyData: SurveyDataset;
  updateSurveyData: (data: SurveyDataset) => void;
  resetSurveyData: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('[DEBUG] AppProvider initializing...');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    console.log('[DEBUG] Resolving initial theme...');
    return resolveInitialTheme();
  });
  const [surveyData, setSurveyData] = useState<SurveyDataset>(() => {
    console.log('[DEBUG] Cloning SURVEY_DATA...');
    const cloned = safeClone(SURVEY_DATA);
    console.log('[DEBUG] Cloned data:', cloned);
    return cloned;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.setProperty('color-scheme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const updateSurveyData = useCallback((data: SurveyDataset) => {
    setSurveyData(safeClone(data));
  }, []);

  const resetSurveyData = useCallback(() => {
    setSurveyData(safeClone(SURVEY_DATA));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    surveyData,
    updateSurveyData,
    resetSurveyData,
    toasts,
    showToast,
    dismissToast,
  }), [theme, toggleTheme, surveyData, updateSurveyData, resetSurveyData, toasts, showToast, dismissToast]);

  console.log('[DEBUG] AppProvider rendering with value:', value);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { type ThemeMode, type Toast };
