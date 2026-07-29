import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { NotFound } from "~/components/NotFound";
import { ErrorPage } from "~/components/ErrorPage";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ErrorPage,
  });
}
