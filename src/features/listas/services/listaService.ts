import { listaRepository, type ListaRepository } from "@/data/listas";
import { marcadoresLocais } from "@/data/preferencias";
import {
  criarListaVazia,
  lerListaDeTexto,
  novoId,
  paraExportacao,
  validarNomeEleicaoUnico,
  type Lista,
} from "@/domain/eleicao";

const CHAVE_SEED = "colinha-eleitoral:seed:v6";

export const NOME_ELEICAO_EXEMPLO = "Exemplo — Eleição Fictícia";

/**
 * Casos de uso das eleições. Depende do repositório apenas pela interface,
 * então as telas nunca falam diretamente com o localStorage.
 */
export function criarListaService(repo: ListaRepository = listaRepository) {
  const service = {
    listar: () => repo.listar(),
    obter: (id: string) => repo.obter(id),
    salvar: (lista: Lista) => repo.salvar(lista),
    remover: (id: string) => repo.remover(id),
    inscrever: (ouvinte: () => void) => repo.inscrever(ouvinte),

    criar(apelido: string): Lista {
      validarNomeEleicaoUnico(repo.listar(), apelido);
      return repo.salvar(criarListaVazia(apelido));
    },

    renomear(id: string, novoApelido: string): Lista {
      const lista = repo.obter(id);
      if (!lista) throw new Error("Eleição não encontrada.");
      validarNomeEleicaoUnico(repo.listar(), novoApelido, id);
      return repo.salvar({ ...lista, apelido: novoApelido.trim() });
    },

    importarDeTexto(texto: string): Lista {
      const importada = lerListaDeTexto(texto);
      validarNomeEleicaoUnico(repo.listar(), importada.apelido);
      return repo.salvar(importada);
    },

    exportarJson(lista: Lista): string {
      return JSON.stringify(paraExportacao(lista));
    },

    /**
     * Apaga os dados do aparelho preservando a eleição fictícia de exemplo.
     */
    apagarTudo(): void {
      const existentes = repo.listar();
      const ficticias = existentes.filter((l) => l.isFicticia);
      repo.limpar();
      marcadoresLocais.ativar(CHAVE_SEED);

      if (ficticias.length > 0) {
        ficticias.forEach((f) => repo.salvar(f));
      } else {
        service.criarEleicaoExemplo();
      }
    },

    /**
     * Cria ou restaura uma eleição fictícia com números fáceis e nomes comuns no Brasil.
     * Marcada com isFicticia: true para nunca ser excluída ao limpar o aparelho.
     */
    criarEleicaoExemplo(): Lista {
      const existentes = repo.listar();
      const existente = existentes.find(
        (l) => l.isFicticia || l.apelido.toLowerCase() === NOME_ELEICAO_EXEMPLO.toLowerCase(),
      );
      if (existente) {
        return existente;
      }

      const agora = new Date().toISOString();
      const exemplo: Lista = {
        id: novoId(),
        apelido: NOME_ELEICAO_EXEMPLO,
        criadaEm: agora,
        atualizadaEm: agora,
        isFicticia: true,
        candidatos: [
          {
            id: novoId(),
            nome: "José Santos",
            codigo: "1010",
            cargo: "Deputado Federal",
          },
          {
            id: novoId(),
            nome: "Maria Silva",
            codigo: "10100",
            cargo: "Deputado Estadual",
          },
          {
            id: novoId(),
            nome: "Ana Oliveira",
            codigo: "100",
            cargo: "Senador",
          },
          {
            id: novoId(),
            nome: "João Souza",
            codigo: "200",
            cargo: "Senador",
          },
          {
            id: novoId(),
            nome: "Antônio Lima",
            codigo: "10",
            cargo: "Governador",
          },
          {
            id: novoId(),
            nome: "Francisco Pereira",
            codigo: "20",
            cargo: "Presidente",
          },
        ],
      };

      return repo.salvar(exemplo);
    },

    /** Dados de exemplo pré-carregados no primeiro acesso. */
    semearExemplo(): void {
      if (typeof window === "undefined") return;
      if (marcadoresLocais.ativo(CHAVE_SEED)) return;
      marcadoresLocais.ativar(CHAVE_SEED);

      const existentes = repo.listar();
      if (existentes.length > 0) return;

      service.criarEleicaoExemplo();
    },
  };

  return service;
}

export const listaService = criarListaService();
