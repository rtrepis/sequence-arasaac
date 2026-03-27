/**
 * Compila tots els fitxers JSON de la carpeta languages/ a src/languages/
 * en format AST (react-intl). Afegir un nou idioma no requereix cap canvi aquí.
 */
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { basename } from "node:path";

const files = readdirSync("languages").filter((f) => f.endsWith(".json"));

for (const file of files) {
  const name = basename(file, ".json");
  console.log(`Compilant ${file}...`);
  execSync(
    `npm run compile -- languages/${file} --ast --out-file src/languages/${name}.json`,
    { stdio: "inherit" }
  );
}
