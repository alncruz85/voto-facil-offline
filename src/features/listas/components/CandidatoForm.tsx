import { useMemo, useState, useEffect } from "react";
import {
  DIGITOS_POR_CARGO,
  obterCargosDisponiveis,
  validarNumeroCandidatoUnico,
  type Candidato,
  type Cargo,
  type Lista,
} from "@/domain/eleicao";
import { ArrowLeft, CheckCircle } from "lucide-react";

export type DadosCandidato = { nome: string; codigo: string; cargo: Cargo };

const VAZIO: DadosCandidato = { nome: "", codigo: "", cargo: "Deputado Federal" };

export function CandidatoForm({
  emEdicao,
  eleicoes,
  eleicaoIdAtual,
  onSelecionarEleicao,
  onSubmit,
  onCancelar,
  onIrParaCriarEleicao,
}: {
  emEdicao: Candidato | null;
  eleicoes: Lista[];
  eleicaoIdAtual: string | null;
  onSelecionarEleicao?: (id: string) => void;
  onSubmit: (dados: DadosCandidato, eleicaoId: string) => void;
  onCancelar: () => void;
  onIrParaCriarEleicao?: () => void;
}) {
  const [eleicaoId, setEleicaoId] = useState<string>(eleicaoIdAtual ?? eleicoes[0]?.id ?? "");
  const [form, setForm] = useState<DadosCandidato>(VAZIO);
  const [erro, setErro] = useState("");
  const [ultimoId, setUltimoId] = useState<string | null>(null);

  // Eleição atualmente selecionada para o cadastro
  const eleicaoAlvo = useMemo(
    () => eleicoes.find((l) => l.id === eleicaoId) ?? eleicoes[0] ?? null,
    [eleicoes, eleicaoId],
  );

  // Lista apenas os cargos que ainda não foram preenchidos (Senador permite até 2)
  const cargosDisponiveis = useMemo(
    () => obterCargosDisponiveis(eleicaoAlvo ?? undefined, emEdicao?.id),
    [eleicaoAlvo, emEdicao],
  );

  // Sincroniza o formulário quando um candidato entra em edição
  const idAtual = emEdicao?.id ?? null;
  if (idAtual !== ultimoId) {
    setUltimoId(idAtual);
    setForm(
      emEdicao ? { nome: emEdicao.nome, codigo: emEdicao.codigo, cargo: emEdicao.cargo } : VAZIO,
    );
    setErro("");
  }

  // Sincroniza a eleição caso o ID ativo mude externamente
  if (eleicaoIdAtual && eleicaoIdAtual !== eleicaoId && !emEdicao) {
    setEleicaoId(eleicaoIdAtual);
  }

  // Ajusta o cargo selecionado para o primeiro disponível caso o atual já esteja preenchido
  useEffect(() => {
    if (!emEdicao && cargosDisponiveis.length > 0) {
      const cargoValido = cargosDisponiveis.some((op) => op.cargo === form.cargo);
      if (!cargoValido) {
        const primeiro = cargosDisponiveis[0];
        setForm((f) => ({
          ...f,
          cargo: primeiro.cargo,
          codigo: f.codigo.slice(0, DIGITOS_POR_CARGO[primeiro.cargo]),
        }));
      }
    }
  }, [cargosDisponiveis, emEdicao, form.cargo]);

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    const nome = form.nome.trim();
    const codigo = form.codigo.replace(/\D/g, "");

    if (eleicoes.length === 0 || !eleicaoId || !eleicaoAlvo) {
      return setErro("Selecione a eleição à qual este candidato estará vinculado.");
    }

    if (!nome) return setErro("Informe o nome do candidato.");
    if (!codigo) return setErro("Informe o código de votação (apenas números).");

    const esperado = DIGITOS_POR_CARGO[form.cargo];
    if (codigo.length !== esperado) {
      return setErro(
        `O código para ${form.cargo} deve ter exatamente ${esperado} dígitos (você digitou ${codigo.length}).`,
      );
    }

    // Regra: O número dos candidatos é ÚNICO dentro da eleição
    try {
      validarNumeroCandidatoUnico(eleicaoAlvo, codigo, emEdicao?.id);
    } catch (err) {
      return setErro(
        err instanceof Error ? err.message : "Número de candidato já utilizado nesta eleição.",
      );
    }

    setErro("");
    onSubmit({ nome, codigo, cargo: form.cargo }, eleicaoId);
    setForm(VAZIO);
  }

  if (eleicoes.length === 0) {
    return (
      <div className="mt-4 rounded-lg border-2 border-dashed border-border bg-card p-6 text-center">
        <h2 className="text-base font-extrabold text-foreground">Nenhuma eleição cadastrada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Todo candidato precisa estar vinculado a uma eleição. Crie uma eleição primeiro para poder
          adicionar candidatos.
        </p>
        {onIrParaCriarEleicao ? (
          <button
            type="button"
            onClick={onIrParaCriarEleicao}
            className="mt-4 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Criar eleição agora
          </button>
        ) : null}
      </div>
    );
  }

  // Caso todos os cargos da eleição já estejam cadastrados
  if (!emEdicao && cargosDisponiveis.length === 0) {
    return (
      <div className="mt-2 rounded-lg border-2 border-border bg-card p-6 text-center">
        <CheckCircle className="h-12 w-12 text-primary mx-auto mb-2" />
        <h2 className="text-lg font-extrabold text-foreground">
          Todos os cargos já foram preenchidos!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          A eleição “{eleicaoAlvo?.apelido}” já possui candidatos cadastrados para todos os cargos
          disponíveis (inclusive as 2 vagas de Senador).
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Ver candidatos desta eleição
          </button>
          {onIrParaCriarEleicao ? (
            <button
              type="button"
              onClick={onIrParaCriarEleicao}
              className="rounded-md border-2 border-primary bg-background px-4 py-2.5 text-sm font-bold text-primary hover:bg-muted"
            >
              Criar outra eleição
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submeter} className="mt-1 rounded-lg border-2 border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
        <h2 className="text-base font-extrabold text-foreground">
          {emEdicao ? "Editar candidato" : "Adicionar novo candidato"}
        </h2>
        <button
          type="button"
          onClick={onCancelar}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground underline decoration-1 underline-offset-2 shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar para Candidatos</span>
        </button>
      </div>

      {/* Vínculo Obrigatório à Eleição */}
      <label htmlFor="cand-eleicao" className="mt-3 block text-sm font-bold">
        Eleição vinculada <span className="text-destructive">*</span>
      </label>
      <select
        id="cand-eleicao"
        value={eleicaoId}
        disabled={Boolean(emEdicao)}
        onChange={(e) => {
          const novoId = e.target.value;
          setEleicaoId(novoId);
          onSelecionarEleicao?.(novoId);
          setErro("");
        }}
        className="mt-1 w-full rounded-md border-2 border-input bg-background px-3 py-2.5 text-base font-semibold disabled:opacity-60"
      >
        {eleicoes.map((el) => (
          <option key={el.id} value={el.id}>
            {el.apelido} ({el.candidatos.length}{" "}
            {el.candidatos.length === 1 ? "candidato" : "candidatos"})
          </option>
        ))}
      </select>
      {emEdicao ? (
        <p className="mt-0.5 text-xs text-muted-foreground">
          O candidato pertence à eleição acima.
        </p>
      ) : null}

      <label htmlFor="cand-nome" className="mt-3 block text-sm font-bold">
        Nome do Candidato <span className="text-destructive">*</span>
      </label>
      <input
        id="cand-nome"
        value={form.nome}
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
        placeholder="Ex: Maria da Silva"
        className="mt-1 w-full rounded-md border-2 border-input bg-background px-3 py-2.5 text-base"
      />

      {/* Cargo: Lista apenas os cargos disponíveis ainda não cadastrados nesta eleição */}
      <label htmlFor="cand-cargo" className="mt-3 block text-sm font-bold">
        Cargo disponível <span className="text-destructive">*</span>
      </label>
      <select
        id="cand-cargo"
        value={form.cargo}
        onChange={(e) => {
          const novoCargo = e.target.value as Cargo;
          const max = DIGITOS_POR_CARGO[novoCargo];
          setForm({
            ...form,
            cargo: novoCargo,
            codigo: form.codigo.slice(0, max),
          });
          setErro("");
        }}
        className="mt-1 w-full rounded-md border-2 border-input bg-background px-3 py-2.5 text-base font-medium"
      >
        {cargosDisponiveis.map((op, idx) => (
          <option key={`${op.cargo}-${op.vaga ?? idx}`} value={op.cargo}>
            {op.rotulo}
          </option>
        ))}
      </select>

      <label htmlFor="cand-codigo" className="mt-3 block text-sm font-bold">
        Código de votação na urna <span className="text-destructive">*</span>
      </label>
      <p id="cand-codigo-dica" className="text-xs text-muted-foreground">
        Exatamente {DIGITOS_POR_CARGO[form.cargo]} dígitos para {form.cargo}. Número único por
        eleição.
      </p>
      <input
        id="cand-codigo"
        value={form.codigo}
        onChange={(e) => setForm({ ...form, codigo: e.target.value.replace(/\D/g, "") })}
        inputMode="numeric"
        aria-describedby="cand-codigo-dica"
        maxLength={DIGITOS_POR_CARGO[form.cargo]}
        placeholder={"0".repeat(DIGITOS_POR_CARGO[form.cargo])}
        className="tabular mt-1 w-full rounded-md border-2 border-input bg-background px-3 py-2.5 text-2xl font-bold tracking-widest"
      />

      {erro ? (
        <p
          role="alert"
          className="mt-3 rounded-md border-2 border-destructive bg-destructive/10 p-2.5 text-sm font-bold text-destructive"
        >
          {erro}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-primary px-4 py-3 text-base font-bold text-primary-foreground shadow-sm hover:opacity-90"
        >
          {emEdicao ? "Salvar alterações" : "Adicionar à eleição"}
        </button>
        {emEdicao ? (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-md border-2 border-input px-4 py-3 text-base font-bold hover:bg-muted"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
