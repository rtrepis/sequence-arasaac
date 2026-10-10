// Copia a l'app les fonts de Google de la llista de fonts (B27).
//
// L'app les servia amb un `@import` a fonts.googleapis.com per família: sense
// accés a Google (sense connexió, o una xarxa d'escola que el bloqueja) el
// document no es veia tal com es va desar, i cada visita enviava l'IP de
// l'usuari a Google. Ara els fitxers viuen a `public/fonts/google/` i el CSS es
// genera a `src/style/fonts-google.css`.
//
// Es fa servir un cop, quan canvia la llista de fonts:
//
//   npx tsx apps/web/scripts/fetch-google-fonts.ts
//
// Treu cada família del paquet de Fontsource (`npm pack`, sense instal·lar-lo):
// els paquets sencers fan 600 MB, i aquí només calen el llatí i el llatí
// ampliat, en `woff2`, dels gruixos 400 i 700. Al costat de cada família s'hi
// copia la seva llicència (OFL o Apache), que l'exigeix.
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const FONT_LIST = path.join(WEB_ROOT, "src/data/fontlist.ts");
const OUT_FILES = path.join(WEB_ROOT, "public/fonts/google");
const OUT_CSS = path.join(WEB_ROOT, "src/style/fonts-google.css");

/** Les fonts pròpies ja viuen a `src/style/fonts/` i no són de Google. */
const LOCAL_FONTS = new Set([
  "Escolar",
  "Massallera",
  "Memima",
  "OpenDyslexic",
  "Pipomayu",
]);

/**
 * Famílies que no es copien. Noto Color Emoji fa 9,4 MB (més que totes les
 * altres juntes) i no té lletres: com a font del text, les lletres ja surten
 * amb la de reserva.
 */
const SKIPPED = new Set(["Noto Color Emoji"]);

const SUBSETS = ["latin", "latin-ext"];
const WEIGHTS = [400, 700];

interface FontsourceMetadata {
  id: string;
  family: string;
  subsets: string[];
  weights: number[];
  version: string;
  license: { type: string };
}

/** Les famílies de Google de la llista de l'app, amb el nom que fa servir l'app. */
const readFamilies = (): string[] => {
  const source = readFileSync(FONT_LIST, "utf8");
  const names = [...source.matchAll(/^\s*"([^"]+)",?\s*$/gm)].map(
    (match) => match[1],
  );
  return names.filter((name) => !LOCAL_FONTS.has(name) && !SKIPPED.has(name));
};

/**
 * El paquet de Fontsource d'una família. «Atkinson-Hyperlegible» porta guionet
 * a l'app; el paquet, com tots, és el nom en minúscules i amb guionets.
 */
const packageId = (family: string): string =>
  family.toLowerCase().replace(/\s+/g, "-");

/** Baixa i desempaqueta un paquet; torna la carpeta on ha quedat. */
const unpack = (id: string, workDir: string): string => {
  const tarball = execFileSync(
    "npm",
    ["pack", `@fontsource/${id}`, "--silent", "--pack-destination", workDir],
    { encoding: "utf8" },
  ).trim();
  const target = path.join(workDir, id);
  mkdirSync(target);
  execFileSync("tar", [
    "-xzf",
    path.join(workDir, tarball),
    "-C",
    target,
    "--strip-components=1",
  ]);
  return target;
};

/** El `unicode-range` d'un subconjunt, del CSS del gruix sencer del paquet. */
const unicodeRange = (
  css: string,
  id: string,
  subset: string,
  weight: number,
): string | undefined => {
  const block = css.split(`/* ${id}-${subset}-${weight}-normal */`)[1];
  return block?.split("}")[0].match(/unicode-range:\s*([^;]+);/)?.[1];
};

const fontFace = (
  family: string,
  weight: number,
  url: string,
  range: string | undefined,
): string =>
  [
    "@font-face {",
    `  font-family: "${family}";`,
    "  font-style: normal;",
    "  font-display: swap;",
    `  font-weight: ${weight};`,
    `  src: url("${url}") format("woff2");`,
    ...(range ? [`  unicode-range: ${range};`] : []),
    "}",
  ].join("\n");

const main = (): void => {
  const families = readFamilies();
  const workDir = mkdtempSync(path.join(tmpdir(), "fontsource-"));
  rmSync(OUT_FILES, { recursive: true, force: true });

  const faces: string[] = [];
  const credits: string[] = [];

  try {
    for (const family of families) {
      const id = packageId(family);
      const dir = unpack(id, workDir);
      const meta = JSON.parse(
        readFileSync(path.join(dir, "metadata.json"), "utf8"),
      ) as FontsourceMetadata;
      const out = path.join(OUT_FILES, id);
      mkdirSync(out, { recursive: true });
      copyFileSync(path.join(dir, "LICENSE"), path.join(out, "LICENSE"));

      for (const weight of WEIGHTS.filter((w) => meta.weights.includes(w))) {
        const css = readFileSync(path.join(dir, `${weight}.css`), "utf8");
        for (const subset of SUBSETS.filter((s) => meta.subsets.includes(s))) {
          const file = `${id}-${subset}-${weight}-normal.woff2`;
          const from = path.join(dir, "files", file);
          if (!existsSync(from)) continue;
          copyFileSync(from, path.join(out, file));
          faces.push(
            fontFace(
              family,
              weight,
              `/fonts/google/${id}/${file}`,
              unicodeRange(css, id, subset, weight),
            ),
          );
        }
      }
      credits.push(
        `${family} (${meta.license.type}, Fontsource ${meta.version})`,
      );
      console.log(`✓ ${family}`);
    }
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }

  const header = [
    "/*",
    " * FITXER GENERAT per `apps/web/scripts/fetch-google-fonts.ts`: no s'edita a mà.",
    " *",
    " * Les fonts de Google de la llista de l'app, servides des de l'app mateixa",
    " * (B27). Un `@font-face` no baixa res fins que algun text el fa servir: només",
    " * es descarreguen les famílies que pinta el document obert.",
    " *",
    ...credits.map((credit) => ` * - ${credit}`),
    " */",
  ].join("\n");

  writeFileSync(OUT_CSS, `${header}\n\n${faces.join("\n\n")}\n`);
  console.log(`${families.length} famílies, ${faces.length} @font-face`);
};

main();
