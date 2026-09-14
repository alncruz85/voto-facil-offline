import { useEffect, useState } from "react";
import type { Lista } from "@/domain/eleicao";
import { listaService } from "../services/listaService";

/** Todas as listas do aparelho; `null` enquanto o cliente hidrata. */
export function useListas(): Lista[] | null {
  const [listas, setListas] = useState<Lista[] | null>(null);

  useEffect(() => {
    listaService.semearExemplo();
    const atualizar = () => setListas(listaService.listar());
    atualizar();
    return listaService.inscrever(atualizar);
  }, []);

  return listas;
}

export type EstadoLista = { pronto: boolean; lista: Lista | undefined };

export function useLista(id: string): EstadoLista {
  const [estado, setEstado] = useState<EstadoLista>({ pronto: false, lista: undefined });

  useEffect(() => {
    const atualizar = () => setEstado({ pronto: true, lista: listaService.obter(id) });
    atualizar();
    return listaService.inscrever(atualizar);
  }, [id]);

  return estado;
}
