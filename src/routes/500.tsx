import { createFileRoute } from "@tanstack/react-router";
import { ErrorPage } from "~/components/ErrorPage";

export const Route = createFileRoute("/500")({
  head: () => ({
    meta: [
      { title: "Erreur serveur — KongoFix" },
      {
        name: "description",
        content:
          "Une erreur inattendue s'est produite sur KongoFix. Veuillez réessayer dans quelques instants.",
      },
    ],
  }),
  component: RouteComponent,
  errorComponent: ErrorPage,
});

function RouteComponent() {
  // This route is normally reached via error boundaries,
  // but can also be navigated to directly.
  return (
    <ErrorPage
      error={new Error("Erreur interne du serveur")}
      reset={undefined as unknown as () => void}
    />
  );
}
