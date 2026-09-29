import '@fontsource-variable/nunito';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Blockly mierzy tekst przy renderowaniu klocków, więc czcionka musi być już wczytana.
await Promise.all([
  document.fonts.load('800 13px "Nunito Variable"'),
  document.fonts.load('700 13px "Nunito Variable"'),
]).catch(() => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
