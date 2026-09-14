import React, { useState, useEffect } from "react";
import {
  LocalStorageListaRepository,
  type Lista,
  type Candidato,
  etapasDaLista,
  adicionarCandidato,
  atualizarCandidato,
  removerCandidato,
  criarListaVazia,
  validarNomeEleicaoUnico,
} from "./domain/eleicao";
import { CARGOS, DIGITOS_POR_CARGO, type Cargo } from "./domain/eleicao/cargos";
import { QrCodeView } from "./components/QrCodeView";
import {
  Plus,
  Trash2,
  Edit2,
  QrCode,
  Play,
  ArrowLeft,
  Check,
  Share2,
  FileText,
  AlertCircle,
  Vote,
  UserCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const repository = new LocalStorageListaRepository();

type ViewState =
  | { name: "listas" }
  | { name: "detalhes"; listaId: string }
  | { name: "urna"; listaId: string }
  | { name: "qr"; listaId: string };

export function App() {
  const [listas, setListas] = useState<Lista[]>([]);
  const [view, setView] = useState<ViewState>({ name: "listas" });
  const [erroGlobal, setErroGlobal] = useState<string | null>(null);

  // Load listas synchronously
  useEffect(() => {
    const atualizar = () => {
      try {
        setListas(repository.listar());
      } catch (err: any) {
        setErroGlobal(err?.message || "Erro ao carregar listas.");
      }
    };
    atualizar();
    return repository.inscrever(atualizar);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView({ name: "listas" })}>
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-xl font-bold shadow">
              🗳️
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Voto Fácil Offline</h1>
              <p className="text-xs text-blue-200">Simulador de Urna & Colinha Eleitoral</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-blue-800/80 px-3 py-1.5 rounded-full border border-blue-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-blue-100">100% Offline</span>
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {erroGlobal && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-center text-red-800 text-sm flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{erroGlobal}</span>
          <button onClick={() => setErroGlobal(null)} className="underline ml-4 font-semibold">Fechar</button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {view.name === "listas" && (
          <ListaView
            listas={listas}
            onSelectLista={(id) => setView({ name: "detalhes", listaId: id })}
            onSimularUrna={(id) => setView({ name: "urna", listaId: id })}
            onCompartilhar={(id) => setView({ name: "qr", listaId: id })}
            onError={setErroGlobal}
          />
        )}

        {view.name === "detalhes" && (
          <DetalhesView
            listaId={view.listaId}
            onBack={() => setView({ name: "listas" })}
            onSimularUrna={(id) => setView({ name: "urna", listaId: id })}
            onCompartilhar={(id) => setView({ name: "qr", listaId: id })}
            onError={setErroGlobal}
          />
        )}

        {view.name === "urna" && (
          <UrnaView
            listaId={view.listaId}
            onBack={() => setView({ name: "detalhes", listaId: view.listaId })}
            onError={setErroGlobal}
          />
        )}

        {view.name === "qr" && (
          <QrView
            listaId={view.listaId}
            onBack={() => setView({ name: "detalhes", listaId: view.listaId })}
            onError={setErroGlobal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Voto Fácil Offline • Totalmente seguro, sem requisições de rede ou rastreamento.
      </footer>
    </div>
  );
}

// ==========================================
// 1. LISTA VIEW (Home)
// ==========================================
function ListaView({
  listas,
  onSelectLista,
  onSimularUrna,
  onCompartilhar,
  onError,
}: {
  listas: Lista[];
  onSelectLista: (id: string) => void;
  onSimularUrna: (id: string) => void;
  onCompartilhar: (id: string) => void;
  onError: (msg: string | null) => void;
}) {
  const [novoApelido, setNovoApelido] = useState("");
  const [importJson, setImportJson] = useState("");
  const [mostrarImportar, setMostrarImportar] = useState(false);

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      validarNomeEleicaoUnico(listas, novoApelido);
      const nova = criarListaVazia(novoApelido);
      repository.salvar(nova);
      setNovoApelido("");
      onSelectLista(nova.id);
    } catch (err: any) {
      onError(err?.message || "Erro ao criar colinha.");
    }
  };

  const handleImportar = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJson) as Lista;
      if (!parsed.id || !parsed.apelido || !Array.isArray(parsed.candidatos)) {
        throw new Error("Formato de JSON de colinha inválido.");
      }
      validarNomeEleicaoUnico(listas, parsed.apelido, parsed.id);
      repository.salvar(parsed);
      setImportJson("");
      setMostrarImportar(false);
      onError(null);
    } catch (err: any) {
      onError(err?.message || "Erro ao importar JSON.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Criar Nova Colinha Eleitoral</h2>
        <p className="text-sm text-slate-600 mb-4">
          Organize seus candidatos para a votação e simule a urna eletrônica com antecedência.
        </p>

        <form onSubmit={handleCriar} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ex: Eleições 2026 - Meu Voto"
            value={novoApelido}
            onChange={(e) => setNovoApelido(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Criar Colinha
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
          <button
            onClick={() => setMostrarImportar(!mostrarImportar)}
            className="text-blue-600 hover:underline font-medium flex items-center"
          >
            <FileText className="w-4 h-4 mr-1.5" /> {mostrarImportar ? "Ocultar Importação" : "Importar Colinha por JSON"}
          </button>
        </div>

        {mostrarImportar && (
          <form onSubmit={handleImportar} className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Cole o código JSON da colinha abaixo:
            </label>
            <textarea
              rows={3}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='{"id": "...", "apelido": "...", "candidatos": []}'
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow"
            >
              Importar Colinha
            </button>
          </form>
        )}
      </div>

      {/* Saved Lists */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>Minhas Colinhas Salvas</span>
          <span className="text-xs font-normal text-slate-500">({listas.length} cadastradas)</span>
        </h3>

        {listas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <Vote className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-slate-700">Nenhuma colinha cadastrada ainda.</p>
            <p className="text-xs text-slate-500 mt-1">Crie sua primeira colinha acima para começar.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listas.map((l) => (
              <div
                key={l.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-slate-800 text-base line-clamp-1">{l.apelido}</h4>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {l.candidatos.length} candidato{l.candidatos.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Atualizada em: {new Date(l.atualizadaEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectLista(l.id)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mb-1" /> Editar
                  </button>
                  <button
                    onClick={() => onSimularUrna(l.id)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition-colors"
                  >
                    <Play className="w-4 h-4 mb-1" /> Simular
                  </button>
                  <button
                    onClick={() => onCompartilhar(l.id)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <QrCode className="w-4 h-4 mb-1" /> QR Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. DETALHES VIEW (Gerenciar Candidatos)
// ==========================================
function DetalhesView({
  listaId,
  onBack,
  onSimularUrna,
  onCompartilhar,
  onError,
}: {
  listaId: string;
  onBack: () => void;
  onSimularUrna: (id: string) => void;
  onCompartilhar: (id: string) => void;
  onError: (msg: string | null) => void;
}) {
  const [lista, setLista] = useState<Lista | undefined>(repository.obter(listaId));
  const [nomeCandidato, setNomeCandidato] = useState("");
  const [codigoCandidato, setCodigoCandidato] = useState("");
  const [cargoCandidato, setCargoCandidato] = useState<Cargo>("Deputado Federal");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editApelido, setEditApelido] = useState(lista?.apelido || "");
  const [editandoNomeLista, setEditandoNomeLista] = useState(false);

  useEffect(() => {
    const l = repository.obter(listaId);
    setLista(l);
    if (l) setEditApelido(l.apelido);
  }, [listaId]);

  if (!lista) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Colinha não encontrada.</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Voltar</button>
      </div>
    );
  }

  const handleSalvarCandidato = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let nova: Lista;
      if (editandoId) {
        nova = atualizarCandidato(lista, editandoId, {
          nome: nomeCandidato,
          codigo: codigoCandidato,
          cargo: cargoCandidato,
        });
        setEditandoId(null);
      } else {
        nova = adicionarCandidato(lista, {
          nome: nomeCandidato,
          codigo: codigoCandidato,
          cargo: cargoCandidato,
        });
      }
      repository.salvar(nova);
      setLista(nova);
      setNomeCandidato("");
      setCodigoCandidato("");
      onError(null);
    } catch (err: any) {
      onError(err?.message || "Erro ao salvar candidato.");
    }
  };

  const handleExcluirCandidato = (id: string) => {
    try {
      const nova = removerCandidato(lista, id);
      repository.salvar(nova);
      setLista(nova);
    } catch (err: any) {
      onError(err?.message || "Erro ao excluir candidato.");
    }
  };

  const handleRenomearLista = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const atualizada: Lista = { ...lista, apelido: editApelido.trim(), atualizadaEm: new Date().toISOString() };
      repository.salvar(atualizada);
      setLista(atualizada);
      setEditandoNomeLista(false);
      onError(null);
    } catch (err: any) {
      onError(err?.message || "Erro ao renomear colinha.");
    }
  };

  const handleExcluirLista = () => {
    if (confirm("Tem certeza que deseja excluir esta colinha?")) {
      repository.remover(lista.id);
      onBack();
    }
  };

  const digitosPermitidos = DIGITOS_POR_CARGO[cargoCandidato] || 5;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar para lista
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSimularUrna(lista.id)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow"
          >
            <Play className="w-4 h-4 mr-1.5" /> Simular Urna
          </button>
          <button
            onClick={() => onCompartilhar(lista.id)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow"
          >
            <QrCode className="w-4 h-4 mr-1.5" /> QR Code
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {editandoNomeLista ? (
            <form onSubmit={handleRenomearLista} className="flex gap-2 flex-1 mr-4">
              <input
                type="text"
                value={editApelido}
                onChange={(e) => setEditApelido(e.target.value)}
                className="flex-1 px-3 py-1.5 text-lg font-bold rounded-lg border border-slate-300"
                required
              />
              <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg">Salvar</button>
            </form>
          ) : (
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-800">{lista.apelido}</h2>
              <button
                onClick={() => setEditandoNomeLista(true)}
                className="text-slate-400 hover:text-blue-600 p-1"
                title="Renomear"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleExcluirLista}
            className="text-red-500 hover:text-red-700 p-2 text-xs font-medium flex items-center"
            title="Excluir Colinha"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Excluir
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Cadastre abaixo os números dos seus candidatos para cada cargo.
        </p>
      </div>

      {/* Form Adicionar/Editar Candidato */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">
          {editandoId ? "Editar Candidato" : "Adicionar Novo Candidato"}
        </h3>

        <form onSubmit={handleSalvarCandidato} className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo</label>
            <select
              value={cargoCandidato}
              onChange={(e) => setCargoCandidato(e.target.value as Cargo)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {CARGOS.map((c) => (
                <option key={c} value={c}>
                  {c} ({DIGITOS_POR_CARGO[c]} dígitos)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número do Candidato ({digitosPermitidos} dígitos)
            </label>
            <input
              type="text"
              maxLength={digitosPermitidos}
              value={codigoCandidato}
              onChange={(e) => setCodigoCandidato(e.target.value.replace(/\D/g, ""))}
              placeholder={`Ex: ${"1".repeat(digitosPermitidos)}`}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome / Apelido</label>
            <input
              type="text"
              value={nomeCandidato}
              onChange={(e) => setNomeCandidato(e.target.value)}
              placeholder="Ex: Nome ou Partido"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
              required
            />
          </div>

          <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
            {editandoId && (
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null);
                  setNomeCandidato("");
                  setCodigoCandidato("");
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow"
            >
              {editandoId ? "Salvar Alterações" : "Adicionar Candidato"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Candidatos Cadastrados */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
          <span>Candidatos na Colinha</span>
          <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
            {lista.candidatos.length} cadastrados
          </span>
        </h3>

        {lista.candidatos.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Nenhum candidato cadastrado nesta colinha ainda.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {lista.candidatos.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg text-sm font-bold">
                      {c.codigo}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm">{c.nome}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Cargo: {c.cargo}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditandoId(c.id);
                      setNomeCandidato(c.nome);
                      setCodigoCandidato(c.codigo);
                      setCargoCandidato(c.cargo);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExcluirCandidato(c.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. URNA VIEW (Simulador Eletrônico Realista)
// ==========================================
function UrnaView({
  listaId,
  onBack,
  onError,
}: {
  listaId: string;
  onBack: () => void;
  onError: (msg: string | null) => void;
}) {
  const lista = repository.obter(listaId);
  const etapas = etapasDaLista(lista);

  const [etapaAtualIndex, setEtapaAtualIndex] = useState(0);
  const [digitosDigitados, setDigitosDigitados] = useState("");
  const [votoFinalizado, setVotoFinalizado] = useState(false);
  const [votosRegistrados, setVotosRegistrados] = useState<Record<string, { candidato?: Candidato; tipo: "candidato" | "branco" | "nulo"; codigo: string }>>({});
  const [somBeep, setSomBeep] = useState(false);

  if (!lista) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Colinha não encontrada.</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Voltar</button>
      </div>
    );
  }

  const etapaAtual = etapas[etapaAtualIndex];
  const digitosNecessarios = etapaAtual ? DIGITOS_POR_CARGO[etapaAtual.cargo] : 5;

  // Find candidate matching entered digits
  const candidatoEncontrado = lista.candidatos.find(
    (c) => c.cargo === etapaAtual?.cargo && c.codigo === digitosDigitados
  );

  const tocarBeep = () => {
    setSomBeep(true);
    setTimeout(() => setSomBeep(false), 200);
  };

  const handleNumeroClick = (num: string) => {
    tocarBeep();
    if (votoFinalizado) return;
    if (digitosDigitados.length < digitosNecessarios) {
      const novo = digitosDigitados + num;
      setDigitosDigitados(novo);
    }
  };

  const handleCorrige = () => {
    tocarBeep();
    setDigitosDigitados("");
  };

  const handleBranco = () => {
    tocarBeep();
    if (!etapaAtual) return;
    if (digitosDigitados.length > 0) {
      setDigitosDigitados("");
      return;
    }
    // Voto em Branco
    registrarVoto({ tipo: "branco", codigo: "BRANCO" });
  };

  const handleConfirma = () => {
    tocarBeep();
    if (!etapaAtual) return;

    if (digitosDigitados.length === digitosNecessarios) {
      if (candidatoEncontrado) {
        registrarVoto({ tipo: "candidato", candidato: candidatoEncontrado, codigo: digitosDigitados });
      } else {
        registrarVoto({ tipo: "nulo", codigo: digitosDigitados });
      }
    }
  };

  const registrarVoto = (voto: { candidato?: Candidato; tipo: "candidato" | "branco" | "nulo"; codigo: string }) => {
    const novosVotos = { ...votosRegistrados, [etapaAtual.cargo + (etapaAtual.vaga || "")] : voto };
    setVotosRegistrados(novosVotos);
    setDigitosDigitados("");

    if (etapaAtualIndex + 1 < etapas.length) {
      setEtapaAtualIndex(etapaAtualIndex + 1);
    } else {
      setVotoFinalizado(true);
    }
  };

  const reiniciarSimulacao = () => {
    setEtapaAtualIndex(0);
    setDigitosDigitados("");
    setVotoFinalizado(false);
    setVotosRegistrados({});
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Sair da Urna
        </button>
        <div className="text-right">
          <h3 className="font-bold text-slate-800 text-sm">{lista.apelido}</h3>
          <p className="text-xs text-slate-500">Simulador Oficial Eletrônico</p>
        </div>
      </div>

      {votoFinalizado ? (
        /* TELA DE FIM / FIM DE VOTAÇÃO */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg animate-fade-in space-y-6">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">
            🇧🇷
          </div>
          <div>
            <h2 className="text-4xl font-extrabold tracking-widest text-slate-900 mb-2">FIM</h2>
            <p className="text-slate-600 font-medium">Seu voto foi simulado e registrado com sucesso!</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-left max-w-md mx-auto border border-slate-200 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Resumo da Votação:</h4>
            {etapas.map((e, i) => {
              const chave = e.cargo + (e.vaga || "");
              const res = votosRegistrados[chave];
              return (
                <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-slate-200 last:border-0">
                  <span className="font-semibold text-slate-700">{e.rotulo}:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {res?.tipo === "branco" ? "VOTO EM BRANCO" : res?.tipo === "nulo" ? `NULO (${res.codigo})` : res?.candidato ? `${res.candidato.nome} (${res.candidato.codigo})` : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={reiniciarSimulacao}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition-all"
          >
            <RotateCcw className="w-5 h-5 mr-2" /> Simular Novamente
          </button>
        </div>
      ) : (
        /* URNA ELETRÔNICA CORPO */
        <div className="bg-slate-100 rounded-3xl border-4 border-slate-300 p-6 shadow-2xl flex flex-col md:flex-row gap-6">
          {/* Tela da Urna (Esquerda) */}
          <div className="flex-1 bg-white rounded-2xl border-2 border-slate-300 p-6 flex flex-col justify-between shadow-inner min-h-[380px]">
            <div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Seu voto para</span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                  Cargo {etapaAtualIndex + 1} de {etapas.length}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">{etapaAtual?.rotulo}</h2>

              {/* Dígitos do Voto */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase">Número:</p>
                <div className="flex gap-2">
                  {Array.from({ length: digitosNecessarios }).map((_, i) => {
                    const digito = digitosDigitados[i] || "";
                    return (
                      <div
                        key={i}
                        className="w-12 h-16 border-2 border-slate-400 bg-white rounded-lg flex items-center justify-center text-3xl font-mono font-bold text-slate-900 shadow-sm"
                      >
                        {digito}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informações do Candidato Encontrado */}
              <div className="mt-6 pt-4 border-t border-slate-100 min-h-[110px]">
                {digitosDigitados.length === digitosNecessarios ? (
                  candidatoEncontrado ? (
                    <div className="space-y-1 animate-fade-in">
                      <p className="text-xs font-bold text-emerald-600 uppercase">Candidato Identificado:</p>
                      <p className="text-lg font-extrabold text-slate-900">{candidatoEncontrado.nome}</p>
                      <p className="text-xs text-slate-500">Código Oficial: {candidatoEncontrado.codigo}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 animate-fade-in">
                      <p className="text-xs font-bold text-amber-600 uppercase">Voto Nulo</p>
                      <p className="text-sm text-slate-600">Nenhum candidato cadastrado com este número na colinha.</p>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-slate-400 italic">Digite o número do candidato no teclado ao lado.</p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 leading-tight">
              Aperte a tecla <span className="font-bold text-green-700">CONFIRMA</span> para gravar este voto ou <span className="font-bold text-orange-700">CORRIGE</span> para refazer.
            </div>
          </div>

          {/* Teclado Numérico da Urna (Direita) */}
          <div className="w-full md:w-72 bg-slate-900 rounded-2xl p-5 flex flex-col justify-between shadow-xl border-2 border-slate-800">
            <div className="text-center mb-4">
              <div className="text-white font-extrabold tracking-widest text-sm mb-0.5">JUSTIÇA ELEITORAL</div>
              <div className="text-[10px] text-slate-400">URNA ELETRÔNICA SIMULADA</div>
            </div>

            {/* Grid 1-9 */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumeroClick(num)}
                  className={`${num === "0" ? "col-start-2" : ""} h-12 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono text-xl font-bold rounded-xl shadow border-b-4 border-slate-950 transition-all`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Botões de Ação da Urna */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleBranco}
                className="h-12 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow border-b-4 border-slate-300 transition-all flex items-center justify-center"
              >
                BRANCO
              </button>
              <button
                onClick={handleCorrige}
                className="h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow border-b-4 border-orange-800 transition-all flex items-center justify-center"
              >
                CORRIGE
              </button>
              <button
                onClick={handleConfirma}
                className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow border-b-4 border-emerald-800 transition-all flex items-center justify-center"
              >
                CONFIRMA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. QR VIEW (Compartilhamento e QR Code)
// ==========================================
function QrView({
  listaId,
  onBack,
  onError,
}: {
  listaId: string;
  onBack: () => void;
  onError: (msg: string | null) => void;
}) {
  const lista = repository.obter(listaId);
  const [copiado, setCopiado] = useState(false);

  if (!lista) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Colinha não encontrada.</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Voltar</button>
      </div>
    );
  }

  const jsonString = JSON.stringify(lista);

  const handleCopiarJson = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(jsonString);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar
        </button>
        <h3 className="font-bold text-slate-800">{lista.apelido}</h3>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800">QR Code da Colinha</h2>
        <p className="text-xs text-slate-500">
          Outro eleitor pode escanear este QR Code para importar sua colinha instantaneamente no aplicativo Voto Fácil.
        </p>

        <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <QrCodeView valor={jsonString} rotulo={`QR Code para ${lista.apelido}`} />
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleCopiarJson}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors flex items-center justify-center"
          >
            {copiado ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
            {copiado ? "Copiado para a Área de Transferência!" : "Copiar Código JSON da Colinha"}
          </button>
        </div>
      </div>
    </div>
  );
}
