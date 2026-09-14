import { createFileRoute } from "@tanstack/react-router";
import { ColinhaPrincipal } from "@/features/listas/components/ColinhaPrincipal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Colinha Eleitoral — Simulador de urna offline" },
      {
        name: "description",
        content:
          "Monte sua colinha de candidatos, compartilhe por QR Code e treine o voto em uma urna eletrônica simulada. Funciona offline, sem conta.",
      },
      { property: "og:title", content: "Colinha Eleitoral — Simulador de urna offline" },
      {
        property: "og:description",
        content:
          "Listas de candidatos com apelido, exportação por QR Code e urna eletrônica simulada. Tudo offline no seu celular.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return <ColinhaPrincipal />;
}
