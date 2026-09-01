// Enllaç al formulari d'issue de GitHub, ja omplert amb un error del registre.
//
// No hi ha cap crida a l'API de GitHub, i és a propòsit: obrir la issue des del
// servidor demanaria un token amb permís d'escriptura al repositori guardat a
// Render —una clau més a mantenir i a poder perdre— i tot el que estalviaria és
// un clic. Amb l'enllaç, qui obre la issue és l'administrador amb el seu compte,
// veu el text abans de publicar-lo i hi pot afegir el que només sap ell: què
// estava passant, si es repeteix, si ja hi ha una issue oberta pel mateix codi.
//
// El correu de l'usuari no hi entra mai. Una issue és pública i el registre
// d'errors no ho és: qui l'obre pot afegir-hi el que calgui, però no pot desfer
// una adreça publicada.

const REPO_ISSUES_URL =
  "https://github.com/rtrepis/sequence-arasaac/issues/new";

/** L'error tal com el necessita l'issue: sense res que identifiqui l'usuari. */
export interface GithubIssueSource {
  code: string;
  context: string;
  detail?: string;
  userAgent?: string;
  createdAt: string;
}

export const buildGithubIssueUrl = (error: GithubIssueSource): string => {
  const body = [
    "### Error arribat a un usuari",
    "",
    `- **Codi:** \`${error.code}\``,
    `- **On:** \`${error.context}\``,
    `- **Quan:** ${new Date(error.createdAt).toISOString()}`,
    `- **Detall:** ${error.detail ?? "—"}`,
    `- **Navegador:** ${error.userAgent ?? "—"}`,
    "",
    "### Què hauria de passar",
    "",
    "<!-- Completa-ho abans de publicar: què esperava l'usuari i què ha vist. -->",
    "",
    "---",
    "Obert des del registre d'errors del panell d'administració.",
  ].join("\n");

  const params = new URLSearchParams({
    title: `[${error.code}] a ${error.context}`,
    body,
    labels: "bug",
  });

  return `${REPO_ISSUES_URL}?${params.toString()}`;
};
