// Validació de les variables d'entorn amb zod
// Si manquen variables obligatòries, el procés s'atura amb un missatge clar

import { resolve } from "path";
import { config } from "dotenv";
import { z } from "zod";

// El .env es busca a l'arrel del paquet, no al directori des d'on s'executa.
// Per defecte dotenv el resol contra process.cwd(), i llavors arrencar l'API
// des de l'arrel del monorepo (npm run dev --workspace=api) no en trobava cap:
// el servidor moria dient que faltaven totes les variables tot i tenir-les.
config({ path: resolve(__dirname, "../../.env") });

// Valors per defecte que només tenen sentit en desenvolupament.
// A producció, deixar-los és pitjor que no tenir-los: els enllaços de
// verificació apuntarien a localhost i els correus sortirien del domini de
// proves de Resend, que només pot escriure al compte del propietari.
const DEV_MAIL_FROM = "SequenciAAC <onboarding@resend.dev>";
const DEV_APP_PUBLIC_URL = "http://localhost:5173";

// Domini de proves del proveïdor de correu. Una adreça d'aquí només pot
// escriure a la bústia del propietari del compte: qualsevol altre destinatari
// es rebutja amb un 403. A producció, doncs, vol dir que els correus interns
// arriben —són per a un mateix— i que cap usuari real rep mai el seu enllaç de
// benvinguda, que és exactament la fallada més difícil de veure que hi ha.
const TEST_MAIL_DOMAIN = "resend.dev";

// Domini d'un remitent, tant si ve com "Nom <bustia@domini>" com a pèl
const mailFromDomain = (mailFrom: string): string => {
  const open = mailFrom.lastIndexOf("<");
  const close = mailFrom.lastIndexOf(">");
  const address = open !== -1 && close > open ? mailFrom.slice(open + 1, close) : mailFrom;
  return address.slice(address.lastIndexOf("@") + 1).trim().toLowerCase();
};

// Es mira el domini, no la cadena sencera. Abans es comparava per igualtat
// exacta amb DEV_MAIL_FROM, i n'hi havia prou de canviar el nom que va davant
// de l'adreça perquè la comprovació passés amb el domini de proves intacte:
// el servidor arrencava, els correus a un mateix arribaven i els dels usuaris
// nous es rebutjaven en silenci.
const isTestMailFrom = (mailFrom: string): boolean => {
  const domain = mailFromDomain(mailFrom);
  return domain === TEST_MAIL_DOMAIN || domain.endsWith(`.${TEST_MAIL_DOMAIN}`);
};

// Esquema de validació — tots els camps obligatoris per arrencar el servidor
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().regex(/^\d+$/).default("3000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI és obligatòria"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET és obligatòria"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET és obligatòria"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  // Només el nom del núvol, no la URL sencera. Cloudinary ofereix la credencial
  // com a `cloudinary://clau:secret@nom-del-nuvol` i enganxar-la aquí deixa el
  // client mal configurat: el servidor arrenca sense queixar-se i cada pujada
  // d'imatge acaba en un 500 que no diu enlloc que el problema és aquest.
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "CLOUDINARY_CLOUD_NAME és obligatòria")
    .refine(
      (value) => !value.includes("://") && !value.includes(":"),
      "CLOUDINARY_CLOUD_NAME ha de ser només el nom del núvol (la part de després de l'@ a la URL cloudinary://…), no la URL sencera",
    ),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY és obligatòria"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET és obligatòria"),

  // --- Antifrau i correu ---
  // Opcionals a l'esquema perquè en desenvolupament es pugui arrencar sense elles
  // (el correu surt per consola i el hash d'IP usa una clau de treball).
  // A producció es comproven a sota i el procés s'atura si en falta cap.

  // Clau de l'HMAC amb què es pseudonimitzen les IP. Canviar-la invalida
  // totes les correlacions anteriors, que és precisament el que ha de passar.
  IP_HASH_SECRET: z.string().default(""),
  RESEND_API_KEY: z.string().default(""),
  // Remitent dels correus — ha de ser d'un domini verificat a Resend
  MAIL_FROM: z.string().default(DEV_MAIL_FROM),
  // Base pública del frontend, per construir l'enllaç de verificació
  APP_PUBLIC_URL: z.string().default(DEV_APP_PUBLIC_URL),
  // Adreça on arriben els avisos d'errors del client. Buida = sense avisos per
  // correu; els errors es continuen registrant i es veuen al panell d'administració.
  ADMIN_ALERT_EMAIL: z.string().default(""),

  // Bústies exemptes del descart de l'alias "+" (vegeu emailCanonical.ts).
  // Únic ús previst: deixar que qui hi apareix es creï diversos comptes de
  // prova (p. ex. algu+ca@gmail.com, algu+es@gmail.com) per verificar cada
  // idioma amb un compte real, sense obrir aquesta porta a la resta d'usuaris.
  // Llista separada per comes; buida = ningú n'està exempt.
  PLUS_ALIAS_EXEMPT_EMAILS: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Error de configuració: variables d'entorn invàlides");
  console.error(parsed.error.format());
  process.exit(1);
}

// Variables que només són obligatòries en producció.
// En desenvolupament tenen alternativa degradada; en producció, no tenir-les
// vol dir enviar correus a enlloc o pseudonimitzar IP amb una clau buida.
const PRODUCTION_REQUIRED = ["IP_HASH_SECRET", "RESEND_API_KEY"] as const;

if (parsed.data.NODE_ENV === "production") {
  const missing: string[] = PRODUCTION_REQUIRED.filter(
    (key) => !parsed.data[key]
  );

  // Aquestes dues sí que tenen valor, però és el de desenvolupament.
  // Sense aquesta comprovació el servidor arrencaria tan tranquil i enviaria
  // correus amb enllaços a localhost: una fallada silenciosa i molt pitjor
  // que no arrencar, perquè no se'n sabria res fins que algú es queixés.
  if (isTestMailFrom(parsed.data.MAIL_FROM)) {
    missing.push(
      `MAIL_FROM (és del domini de proves ${TEST_MAIL_DOMAIN}: només pot escriure a la bústia del compte del proveïdor, i cap usuari nou rebria el correu de benvinguda). Cal un domini verificat.`
    );
  }
  if (parsed.data.APP_PUBLIC_URL === DEV_APP_PUBLIC_URL) {
    missing.push("APP_PUBLIC_URL (encara apunta a localhost)");
  }

  if (missing.length > 0) {
    console.error(
      `Error de configuració: a producció calen ${missing.join(", ")}`
    );
    process.exit(1);
  }
}

// Exportació tipada de les variables d'entorn validades
export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
} as const;
