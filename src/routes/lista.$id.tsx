import { createFileRoute } from "@tanstack/react-router";
import { ColinhaPrincipal } from "@/features/listas/components/ColinhaPrincipal";

export const Route = createFileRoute("/lista/$id")({
  head: () => ({
    meta: [
      { title: "Editar lista de candidatos — Colinha Eleitoral" },
      {
        name: "description",
        content:
          "Cadastre candidatos com nome, código de votação e cargo, e compartilhe a lista por QR Code.",
      },
      { property: "og:title", content: "Editar lista de candidatos — Colinha Eleitoral" },
      {
        property: "og:description",
        content: "Cadastre candidatos com nome, código e cargo e compartilhe por QR Code.",
      },
    ],
  }),
  component: EditarLista,
});

function EditarLista() {
  const { id } = Route.useParams();
  return <ColinhaPrincipal listaIdInicial={id} />;
}
