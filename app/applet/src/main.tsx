import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// Global Debug Logger & Splash Screen overlay for Capacitor / Web APK
class DebugLogger {
  logs: Array<{ time: string; type: 'info' | 'error' | 'warn'; message: string }> = [];
  listeners: ((logs: Array<{ time: string; type: 'info' | 'error' | 'warn'; message: string }>) => void)[] = [];

  log(message: string, type: 'info' | 'error' | 'warn' = 'info') {
    const time = new Date().toLocaleTimeString();
    this.logs.unshift({ time, type, message });
    console.log(`[VotoFácil ${type.toUpperCase()}] ${message}`);
    this.listeners.forEach(l => l([...this.logs]));
  }

  subscribe(listener: (logs: Array<{ time: string; type: 'info' | 'error' | 'warn'; message: string }>) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const debugLogger = new DebugLogger();

// Capture global errors
if (typeof window !== 'undefined') {
  window.onerror = (msg, url, line, col, error) => {
    debugLogger.log(`Global Error: ${msg} at ${url}:${line}:${col} - ${error?.stack || ''}`, 'error');
  };
  window.onunhandledrejection = (event) => {
    debugLogger.log(`Unhandled Rejection: ${event.reason?.message || event.reason}`, 'error');
  };
}

function DebugSplashScreen({ onStart }: { onStart: () => void }) {
  const [logs, setLogs] = useState(debugLogger.logs);
  const [showLogs, setShowLogs] = useState(true);

  useEffect(() => {
    return debugLogger.subscribe(setLogs);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-slate-100 p-6 overflow-y-auto">
      <div className="max-w-md mx-auto w-full my-auto flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg mb-4 animate-pulse">
          🗳️
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Voto Fácil Offline</h1>
        <p className="text-sm text-slate-400 mb-6">Modo de Diagnóstico & Splash Screen</p>

        <button
          onClick={onStart}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-md transition-all mb-4"
        >
          Entrar no Aplicativo 🚀
        </button>

        <button
          onClick={() => setShowLogs(!showLogs)}
          className="text-xs text-slate-400 hover:text-slate-200 underline mb-2"
        >
          {showLogs ? "Ocultar Logs de Diagnóstico" : "Mostrar Logs de Diagnóstico"}
        </button>

        {showLogs && (
          <div className="w-full bg-slate-950 rounded-xl p-4 text-left font-mono text-xs max-h-64 overflow-y-auto border border-slate-800 shadow-inner">
            <div className="text-slate-500 mb-2 font-semibold">--- Console & Event Logs ---</div>
            {logs.length === 0 ? (
              <div className="text-slate-600 italic">Nenhum log registrado ainda...</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className={`mb-1 break-words ${l.type === 'error' ? 'text-red-400 font-bold' : l.type === 'warn' ? 'text-yellow-400' : 'text-slate-300'}`}>
                  <span className="text-slate-500">[{l.time}]</span> {l.message}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [router, setRouter] = useState<any>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    debugLogger.log("MainApp montado. Inicializando router...");
    try {
      const r = getRouter();
      setRouter(r);
      debugLogger.log("Router inicializado com sucesso.");
    } catch (err: any) {
      const errMessage = err?.message || String(err);
      debugLogger.log(`Erro ao inicializar router: ${errMessage}`, 'error');
      setInitError(errMessage);
    }
  }, []);

  if (initError) {
    return (
      <div className="p-6 bg-red-950 text-red-200 min-h-screen flex flex-col justify-center items-center text-center">
        <h2 className="text-xl font-bold mb-2">Erro Crítico de Inicialização</h2>
        <p className="font-mono text-sm bg-red-900/50 p-4 rounded-lg max-w-lg mb-4">{initError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
        >
          Recarregar App
        </button>
      </div>
    );
  }

  if (showSplash) {
    return <DebugSplashScreen onStart={() => {
      debugLogger.log("Usuário clicou em Entrar no Aplicativo.");
      setShowSplash(false);
    }} />;
  }

  if (!router) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

debugLogger.log("Aplicação iniciada (main.tsx carregado).");

const rootElement = document.getElementById("root");
if (rootElement) {
  debugLogger.log("Elemento root encontrado. Renderizando React...");
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <MainApp />
      </React.StrictMode>
    );
    debugLogger.log("React renderizado com sucesso.");
  } catch (err: any) {
    debugLogger.log(`Erro ao renderizar React: ${err?.message || err}`, 'error');
  }
} else {
  debugLogger.log("ERRO: Elemento root #root não encontrado no DOM!", 'error');
}
