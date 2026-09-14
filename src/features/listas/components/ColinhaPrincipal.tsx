import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Users,
  FolderTree,
  Vote,
  Wrench,
  Plus,
  QrCode,
  Trash2,
  Check,
  PlayCircle,
  Edit3,
  Sparkles,
  Info,
  ShieldCheck,
  Smartphone,
  Share2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppShell } from "@/components/AppShell";
import { CandidatoForm, type DadosCandidato } from "@/features/listas/components/CandidatoForm";
import { CandidatosLista } from "@/features/listas/components/CandidatosLista";
import { CompartilharLista } from "@/features/listas/components/CompartilharLista";
import { ContadorEleicoes } from "@/features/listas/components/ContadorEleicoes";
import { useListas } from "@/features/listas/hooks/useListas";
import { listaService } from "@/features/listas/services/listaService";
import {
  adicionarCandidato,
  atualizarCandidato,
  removerCandidato,
  type Candidato,
} from "@/domain/eleicao";

export type AbaPrincipal = "eleicoes" | "candidatos" | "simulacao" | "utilitarios" | "formulario";

export function ColinhaPrincipal({ listaIdInicial }: { listaIdInicial?: string }) {
  const listas = useListas();
  const navigate = useNavigate();

  const [listaAtivaId, setListaAtivaId] = useState<string | null>(listaIdInicial ?? null);
  const [eleicaoSimulacaoId, setEleicaoSimulacaoId] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaPrincipal>("candidatos");
  const [emEdicao, setEmEdicao] = useState<Candidato | null>(null);
  const [aviso, setAviso] = useState("");
  const [apelidoEdit, setApelidoEdit] = useState<string | null>(null);
  const [novoApelido, setNovoApelido] = useState("");
  const [modalExcluir, setModalExcluir] = useState<{
    titulo: string;
    descricao: string;
    onConfirmar: () => void;
  } | null>(null);

  // Determina a eleição atualmente ativa
  const listaAtiva = useMemo(() => {
    if (!listas || listas.length === 0) return null;
    if (listaAtivaId) {
      const encontrada = listas.find((l) => l.id === listaAtivaId);
      if (encontrada) return encontrada;
    }
    if (listaIdInicial) {
      const encontrada = listas.find((l) => l.id === listaIdInicial);
      if (encontrada) return encontrada;
    }
    return listas[0];
  }, [listas, listaAtivaId, listaIdInicial]);

  // Mantém listaAtivaId sincronizado com a eleição encontrada
  useEffect(() => {
    if (listaAtiva && listaAtiva.id !== listaAtivaId) {
      setListaAtivaId(listaAtiva.id);
    }
  }, [listaAtiva, listaAtivaId]);

  // Mantém a eleição selecionada para simulação sincronizada com a ativa por padrão
  useEffect(() => {
    if (listaAtiva && !eleicaoSimulacaoId) {
      setEleicaoSimulacaoId(listaAtiva.id);
    }
  }, [listaAtiva, eleicaoSimulacaoId]);

  const eleicaoParaSimulacao = useMemo(() => {
    if (!listas || listas.length === 0) return null;
    if (eleicaoSimulacaoId) {
      const encontrada = listas.find((l) => l.id === eleicaoSimulacaoId);
      if (encontrada) return encontrada;
    }
    return listaAtiva;
  }, [listas, eleicaoSimulacaoId, listaAtiva]);

  const jsonCompartilhar = useMemo(
    () => (listaAtiva ? listaService.exportarJson(listaAtiva) : ""),
    [listaAtiva],
  );

  function salvarCandidato(dados: DadosCandidato, eleicaoId: string) {
    const eleicaoAlvo = listas?.find((l) => l.id === eleicaoId) ?? listaAtiva;
    if (!eleicaoAlvo) return;

    try {
      listaService.salvar(
        emEdicao
          ? atualizarCandidato(eleicaoAlvo, emEdicao.id, dados)
          : adicionarCandidato(eleicaoAlvo, dados),
      );
      setListaAtivaId(eleicaoAlvo.id);
      setAviso(
        emEdicao
          ? `Candidato ${dados.nome} atualizado com sucesso.`
          : `Candidato ${dados.nome} adicionado à eleição “${eleicaoAlvo.apelido}”.`,
      );
      setEmEdicao(null);
      setAbaAtiva("candidatos");
    } catch (err) {
      setAviso(err instanceof Error ? err.message : "Erro ao salvar candidato.");
    }
  }

  function excluirCandidato(c: Candidato) {
    if (!listaAtiva) return;
    setModalExcluir({
      titulo: "Excluir candidato?",
      descricao: `Deseja realmente remover ${c.nome} (${c.cargo}) desta eleição? A eleição continuará existindo.`,
      onConfirmar: () => {
        listaService.salvar(removerCandidato(listaAtiva, c.id));
        if (emEdicao?.id === c.id) {
          setEmEdicao(null);
        }
        setAviso(`Candidato ${c.nome} excluído.`);
        setModalExcluir(null);
      },
    });
  }

  function criarNovaEleicao(e: React.FormEvent) {
    e.preventDefault();
    const nome = novoApelido.trim();
    if (!nome) {
      setAviso("Informe um nome para a nova eleição.");
      return;
    }
    try {
      const criada = listaService.criar(nome);
      setNovoApelido("");
      setListaAtivaId(criada.id);
      setAbaAtiva("candidatos");
      setAviso(`Eleição “${nome}” criada com sucesso.`);
    } catch (err) {
      setAviso(err instanceof Error ? err.message : "Erro ao criar eleição.");
    }
  }

  function criarEleicaoFicticiaExemplo() {
    try {
      const exemplo = listaService.criarEleicaoExemplo();
      setListaAtivaId(exemplo.id);
      setAbaAtiva("candidatos");
      setAviso("Eleição de exemplo criada com sucesso com números fáceis!");
    } catch (err) {
      setAviso(err instanceof Error ? err.message : "Erro ao criar eleição de exemplo.");
    }
  }

  function excluirEleicao(id: string, apelido: string) {
    setModalExcluir({
      titulo: "Excluir eleição?",
      descricao: `Deseja realmente apagar a eleição “${apelido}”? Todos os candidatos vinculados a ela serão permanentemente excluídos.`,
      onConfirmar: () => {
        listaService.remover(id);
        if (listaAtivaId === id) {
          setListaAtivaId(null);
        }
        setAviso(`Eleição “${apelido}” excluída.`);
        setModalExcluir(null);
      },
    });
  }

  // Barra de navegação principal: 1. Eleições | 2. Candidatos | 3. Simulação | 4. Utilitários
  const barraBotoes = (
    <nav
      className="bg-background border-b-2 border-border px-3 py-2"
      aria-label="Navegação principal"
    >
      <div className="mx-auto max-w-2xl grid grid-cols-4 gap-1.5 sm:gap-2">
        {/* Botão 1: 1. Eleições */}
        <button
          type="button"
          onClick={() => setAbaAtiva("eleicoes")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-lg border-2 px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-bold transition-colors ${
            abaAtiva === "eleicoes"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          <FolderTree className="h-4 w-4 shrink-0" />
          <span className="truncate">1. Eleições</span>
        </button>

        {/* Botão 2: 2. Candidatos */}
        <button
          type="button"
          onClick={() => setAbaAtiva("candidatos")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-lg border-2 px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-bold transition-colors ${
            abaAtiva === "candidatos"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span className="truncate">2. Candidatos</span>
        </button>

        {/* Botão 3: 3. Simulação (Abre o menu de simulação sem disparar a urna diretamente) */}
        <button
          type="button"
          onClick={() => setAbaAtiva("simulacao")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-lg border-2 px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-bold transition-colors ${
            abaAtiva === "simulacao"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          <Vote className="h-4 w-4 shrink-0" />
          <span className="truncate">3. Simulação</span>
        </button>

        {/* Botão 4: 4. Utilitários */}
        <button
          type="button"
          onClick={() => setAbaAtiva("utilitarios")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-lg border-2 px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-bold transition-colors ${
            abaAtiva === "utilitarios"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          <Wrench className="h-4 w-4 shrink-0" />
          <span className="truncate">4. Utilitários</span>
        </button>
      </div>
    </nav>
  );

  return (
    <AppShell
      titulo="Voto Fácil"
      descricao={
        listaAtiva
          ? `Eleição ativa: ${listaAtiva.apelido} · ${listaAtiva.candidatos.length} ${listaAtiva.candidatos.length === 1 ? "candidato" : "candidatos"}`
          : "Nenhuma eleição selecionada"
      }
      subHeader={barraBotoes}
    >
      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>

      {/* Alerta de aviso contextual */}
      {aviso && (
        <div className="shrink-0 mb-3 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs sm:text-sm font-semibold text-primary flex items-center justify-between">
          <span>{aviso}</span>
          <button
            type="button"
            onClick={() => setAviso("")}
            className="text-xs font-bold underline ml-2"
          >
            Fechar
          </button>
        </div>
      )}

      {/* CASO: Nenhuma eleição encontrada no aparelho */}
      {!listaAtiva && (listas === null || listas.length === 0) ? (
        <div className="flex-1 min-h-0 flex flex-col justify-center items-center text-center p-4">
          <FolderTree className="h-12 w-12 text-primary/60 mb-2" />
          <h2 className="text-lg font-extrabold text-foreground">Nenhuma eleição cadastrada</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Crie sua própria eleição ou gere uma eleição fictícia de exemplo com 1 clique para
            testar.
          </p>
          <div className="mt-4 flex flex-col gap-2.5 w-full max-w-sm">
            <button
              type="button"
              onClick={criarEleicaoFicticiaExemplo}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              <span>Criar eleição de exemplo (1 clique)</span>
            </button>
            <form onSubmit={criarNovaEleicao} className="flex gap-2 w-full">
              <input
                value={novoApelido}
                onChange={(e) => setNovoApelido(e.target.value)}
                placeholder="Ex: Eleições Gerais 2026"
                className="flex-1 rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md border-2 border-primary bg-background px-4 py-2 text-sm font-bold text-primary hover:bg-muted"
              >
                Criar
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* ABA 1: GERENCIAMENTO DE ELEIÇÕES */}
      {abaAtiva === "eleicoes" ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="shrink-0 mb-2 border-b border-border pb-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estrutura de dados
              </span>
              <h2 className="text-lg font-extrabold text-foreground">1. Minhas Eleições</h2>
            </div>
            {/* Botão de 1 clique para eleição fictícia */}
            <button
              type="button"
              onClick={criarEleicaoFicticiaExemplo}
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-primary bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Exemplo (1 clique)</span>
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scroll-permitido space-y-4 pr-1 pb-6">
            {/* Seção 1: Alternar entre eleições cadastradas */}
            <section className="rounded-lg border-2 border-border bg-card p-3.5">
              <h3 className="text-sm font-bold">Eleições cadastradas no aparelho</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Selecione qual eleição deseja gerenciar ou simular.
              </p>
              <div className="mt-2 space-y-2">
                {listas?.map((l) => {
                  const isAtiva = listaAtiva?.id === l.id;
                  return (
                    <div
                      key={l.id}
                      className={`flex items-center justify-between gap-2 rounded-md border-2 p-2.5 transition-colors ${
                        isAtiva ? "border-primary bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {l.apelido}{" "}
                          {isAtiva && (
                            <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.2 text-[11px] font-bold text-primary-foreground">
                              <Check className="h-3 w-3 inline" /> Ativa
                            </span>
                          )}
                          {l.isFicticia && (
                            <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-secondary px-1.5 py-0.2 text-[10px] font-semibold text-secondary-foreground">
                              Exemplo
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {l.candidatos.length}{" "}
                          {l.candidatos.length === 1
                            ? "candidato vinculado"
                            : "candidatos vinculados"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isAtiva && (
                          <button
                            type="button"
                            onClick={() => {
                              setListaAtivaId(l.id);
                              setEleicaoSimulacaoId(l.id);
                              setEmEdicao(null);
                              setAbaAtiva("candidatos");
                              setAviso(`Eleição “${l.apelido}” ativada.`);
                            }}
                            className="rounded-md border-2 border-primary bg-background px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/10"
                          >
                            Usar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => excluirEleicao(l.id, l.apelido)}
                          className="rounded-md border border-destructive p-1.5 text-xs text-destructive hover:bg-destructive/10"
                          title={`Excluir ${l.apelido}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Seção 2: Criar nova eleição */}
            <form
              onSubmit={criarNovaEleicao}
              className="rounded-lg border-2 border-border bg-card p-3.5"
            >
              <label htmlFor="criar-apelido" className="block text-sm font-bold">
                Criar nova eleição
              </label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                O nome deve ser único (ex: Eleições Municipais 2024, Eleições Gerais 2026).
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  id="criar-apelido"
                  value={novoApelido}
                  onChange={(e) => setNovoApelido(e.target.value)}
                  placeholder="Nome único da eleição"
                  className="min-w-0 flex-1 rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground border border-input hover:bg-muted"
                >
                  Criar
                </button>
              </div>
            </form>

            {/* Seção 3: Renomear eleição ativa */}
            {listaAtiva && (
              <section className="rounded-lg border-2 border-border bg-card p-3.5">
                <label htmlFor="apelido-atual" className="block text-sm font-bold">
                  Renomear eleição ativa ({listaAtiva.apelido})
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="apelido-atual"
                    value={apelidoEdit ?? listaAtiva.apelido}
                    onChange={(e) => setApelidoEdit(e.target.value)}
                    className="min-w-0 flex-1 rounded-md border-2 border-input bg-background px-3 py-2 text-sm font-medium"
                  />
                  <button
                    type="button"
                    disabled={apelidoEdit === null || apelidoEdit.trim() === ""}
                    onClick={() => {
                      const novo = (apelidoEdit ?? "").trim();
                      if (!novo) return;
                      try {
                        listaService.renomear(listaAtiva.id, novo);
                        setApelidoEdit(null);
                        setAviso(`Nome da eleição alterado para “${novo}”.`);
                      } catch (err) {
                        setAviso(err instanceof Error ? err.message : "Erro ao renomear.");
                      }
                    }}
                    className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
                  >
                    Salvar
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      ) : null}

      {/* ABA 2: LISTA DOS CANDIDATOS DA ELEIÇÃO ATIVA (Sem scrolling extra) */}
      {listaAtiva && abaAtiva === "candidatos" ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Topo fixo: Mostra a Eleição Ativa e o botão de Adicionar */}
          <div className="shrink-0 mb-3 flex items-center justify-between gap-2 border-b border-border pb-2.5">
            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Eleição ativa
              </span>
              <h2 className="truncate text-lg font-extrabold text-foreground">
                {listaAtiva.apelido}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmEdicao(null);
                setAbaAtiva("formulario");
              }}
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-primary bg-primary px-3 py-1.5 text-xs sm:text-sm font-bold text-primary-foreground hover:opacity-90 shadow-sm shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar Candidato
            </button>
          </div>

          {/* Container COM ROLAGEM EXCLUSIVA para a lista de candidatos (sem botões de simulação abaixo) */}
          <div className="flex-1 min-h-0 overflow-y-auto scroll-permitido pr-1 pb-4">
            <CandidatosLista
              candidatos={listaAtiva.candidatos}
              onEditar={(cand) => {
                setEmEdicao(cand);
                setAbaAtiva("formulario");
              }}
              onExcluir={excluirCandidato}
            />
          </div>
        </div>
      ) : null}

      {/* ABA 3: SIMULAÇÃO DA URNA (Escolha da eleição e os dois modos de simulação) */}
      {abaAtiva === "simulacao" ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="shrink-0 mb-2 border-b border-border pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Treino de Votação
            </span>
            <h2 className="text-lg font-extrabold text-foreground">3. Simulação da Urna</h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scroll-permitido space-y-4 pr-1 pb-6">
            {/* Escolha da Eleição a ser Simulada */}
            <section className="rounded-lg border-2 border-border bg-card p-4">
              <label htmlFor="simular-eleicao-select" className="block text-sm font-bold">
                Qual eleição deseja simular?
              </label>
              <select
                id="simular-eleicao-select"
                value={eleicaoParaSimulacao?.id ?? ""}
                onChange={(e) => setEleicaoSimulacaoId(e.target.value)}
                className="mt-2 w-full rounded-md border-2 border-input bg-background px-3 py-2.5 text-base font-semibold"
              >
                {listas?.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.apelido} ({el.candidatos.length}{" "}
                    {el.candidatos.length === 1 ? "candidato" : "candidatos"})
                  </option>
                ))}
              </select>

              {eleicaoParaSimulacao ? (
                <div className="mt-3 rounded-md bg-muted/50 p-3 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      Cargos configurados para a urna:
                    </span>
                    <span className="text-xs font-extrabold text-primary">
                      {eleicaoParaSimulacao.candidatos.length}{" "}
                      {eleicaoParaSimulacao.candidatos.length === 1 ? "cargo" : "cargos"}
                    </span>
                  </div>
                  {eleicaoParaSimulacao.candidatos.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {eleicaoParaSimulacao.candidatos.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center rounded-md bg-background border px-2 py-1 text-xs font-bold text-foreground shadow-xs"
                        >
                          {c.cargo}: <span className="ml-1 text-primary">{c.codigo}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-destructive font-semibold">
                      Nenhum candidato cadastrado nesta eleição ainda. Adicione candidatos na aba 2.
                      Candidatos para treinar.
                    </p>
                  )}
                </div>
              ) : null}
            </section>

            {/* Os Dois Botões de Simulação */}
            {eleicaoParaSimulacao ? (
              <section className="space-y-3">
                {/* Botão 1: Simular urna preenchida */}
                <Link
                  to="/urna/$id"
                  params={{ id: eleicaoParaSimulacao.id }}
                  search={{ modo: "preenchido" }}
                  className="flex items-center justify-center gap-2.5 w-full rounded-lg bg-primary px-4 py-4 text-center text-base font-extrabold text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
                >
                  <PlayCircle className="h-5 w-5" />
                  <span>Simular urna preenchida</span>
                </Link>
                <p className="text-xs text-muted-foreground text-center -mt-1 px-2">
                  Carrega a urna eletrônica com os números dos seus candidatos já preenchidos para
                  conferência e confirmação rápida.
                </p>

                {/* Botão 2: Simular urna para preenchimento (treino livre) */}
                <Link
                  to="/urna/$id"
                  params={{ id: eleicaoParaSimulacao.id }}
                  search={{ modo: "manual" }}
                  className="flex items-center justify-center gap-2.5 w-full rounded-lg border-2 border-primary bg-background px-4 py-3.5 text-center text-base font-extrabold text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit3 className="h-5 w-5" />
                  <span>Simular urna para preenchimento</span>
                </Link>
                <p className="text-xs text-muted-foreground text-center -mt-1 px-2">
                  Abre a urna com o visor limpo para você testar sua memória e digitar os números
                  dos candidatos no teclado numérico.
                </p>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ABA 4: UTILITÁRIOS (Sobre o App, QR Code, Importação e Limpeza de Dados) */}
      {abaAtiva === "utilitarios" ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="shrink-0 mb-2 border-b border-border pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ferramentas & Informações
            </span>
            <h2 className="text-lg font-extrabold text-foreground">4. Utilitários</h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scroll-permitido space-y-4 pr-1 pb-6">
            {/* Seção 0: Contador Regressivo para as Eleições */}
            <ContadorEleicoes />

            {/* Seção 2: Compartilhar Eleição Ativa (QR Code) (Alteração #1) */}
            {listaAtiva && (
              <section className="rounded-lg border-2 border-border bg-card p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold">Compartilhar eleição ativa por QR Code</h3>
                </div>
                <CompartilharLista apelido={listaAtiva.apelido} json={jsonCompartilhar} />
              </section>
            )}

            {/* Seção 3: Importar por QR Code (Alteração #1) */}
            <section className="rounded-lg border-2 border-border bg-card p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Importar eleição de outro aparelho</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Leia o QR Code gerado por outro celular ou cole os dados em formato JSON.
              </p>
              <Link
                to="/importar"
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary bg-background px-4 py-2.5 text-center text-sm font-bold text-primary hover:bg-muted transition-colors"
              >
                <QrCode className="h-4 w-4" /> Abrir Leitor de QR Code
              </Link>
            </section>

            {/* Seção 4: Privacidade & Reset (Alteração #1 e #4) */}
            <section className="rounded-lg border-2 border-border p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Privacidade & Armazenamento</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Todos os dados ficam salvos exclusivamente no armazenamento interno deste aparelho.
                A eleição de exemplo com números fáceis é sempre preservada para referência.
              </p>
              <button
                type="button"
                onClick={() => {
                  setModalExcluir({
                    titulo: "Apagar dados do aparelho?",
                    descricao:
                      "Esta ação apagará as eleições e candidatos criados por você neste aparelho. A eleição de exemplo será mantida.",
                    onConfirmar: () => {
                      listaService.apagarTudo();
                      setListaAtivaId(null);
                      setAviso(
                        "Dados do aparelho limpos com sucesso. A eleição de exemplo foi mantida.",
                      );
                      setModalExcluir(null);
                    },
                  });
                }}
                className="mt-3 rounded-md border-2 border-destructive px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                Limpar dados do aparelho
              </button>
            </section>
          </div>
        </div>
      ) : null}

      {/* ABA FORMULÁRIO: CADASTRO / ALTERAÇÃO DE CANDIDATO */}
      {abaAtiva === "formulario" ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto scroll-permitido pr-1 pb-4">
            <CandidatoForm
              emEdicao={emEdicao}
              eleicoes={listas ?? []}
              eleicaoIdAtual={listaAtivaId}
              onSelecionarEleicao={(id) => setListaAtivaId(id)}
              onSubmit={salvarCandidato}
              onCancelar={() => {
                setEmEdicao(null);
                setAbaAtiva("candidatos");
              }}
              onIrParaCriarEleicao={() => setAbaAtiva("eleicoes")}
            />
          </div>
        </div>
      ) : null}

      {/* Modal Acessível de Confirmação de Exclusão */}
      <AlertDialog
        open={modalExcluir !== null}
        onOpenChange={(aberto) => !aberto && setModalExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{modalExcluir?.titulo}</AlertDialogTitle>
            <AlertDialogDescription>{modalExcluir?.descricao}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => modalExcluir?.onConfirmar()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
