// Tests de la canonicalització d'adreces de correu.
// És la peça que impedeix que una mateixa bústia obri comptes il·limitats,
// i per això és la que ha d'estar coberta abans que cap altra.

import { describe, it, expect, afterEach, vi } from "vitest";
import { toCanonicalEmail } from "./emailCanonical";

describe("toCanonicalEmail", () => {
  it("hauria de normalitzar majúscules i espais", () => {
    expect(toCanonicalEmail("  Algu@Example.com  ")).toBe("algu@example.com");
  });

  it("hauria d'ignorar els punts de la part local a Gmail", () => {
    expect(toCanonicalEmail("a.l.g.u@gmail.com")).toBe("algu@gmail.com");
  });

  it("hauria de descartar l'alias després del signe més a Gmail", () => {
    expect(toCanonicalEmail("algu+prova@gmail.com")).toBe("algu@gmail.com");
  });

  it("hauria de tractar com el mateix compte totes les variants de Gmail", () => {
    const canonical = toCanonicalEmail("algu@gmail.com");
    expect(toCanonicalEmail("a.lg.u+qualsevol@gmail.com")).toBe(canonical);
    // googlemail.com és el nom històric de gmail.com: la mateixa bústia
    expect(toCanonicalEmail("A.L.G.U@googlemail.com")).toBe(canonical);
  });

  it("hauria de conservar els punts als dominis que sí que els distingeixen", () => {
    // A un domini corporatiu, joan.puig i joanpuig poden ser dues persones
    expect(toCanonicalEmail("joan.puig@escola.cat")).toBe("joan.puig@escola.cat");
  });

  it("hauria de descartar l'alias a Outlook però conservar-hi els punts", () => {
    expect(toCanonicalEmail("joan.puig+feina@outlook.com")).toBe(
      "joan.puig@outlook.com"
    );
  });

  it("hauria de deixar intactes els dominis desconeguts", () => {
    expect(toCanonicalEmail("algu+etiqueta@domini-propi.org")).toBe(
      "algu+etiqueta@domini-propi.org"
    );
  });

  it("hauria de conservar l'original si l'alias buida la part local", () => {
    // "+algu@gmail.com" donaria una clau buida que col·lisionaria amb tothom
    expect(toCanonicalEmail("+algu@gmail.com")).toBe("+algu@gmail.com");
  });
});

describe("toCanonicalEmail amb PLUS_ALIAS_EXEMPT_EMAILS", () => {
  const ORIGINAL_ENV = process.env.PLUS_ALIAS_EXEMPT_EMAILS;

  // env.ts llegeix process.env un sol cop, en importar-se: cal buidar el
  // registre de mòduls perquè el canvi de variable es vegi reflectit.
  afterEach(() => {
    process.env.PLUS_ALIAS_EXEMPT_EMAILS = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("hauria de conservar l'alias per a una bústia exempta, per crear comptes de prova", async () => {
    process.env.PLUS_ALIAS_EXEMPT_EMAILS = "algu@gmail.com";
    vi.resetModules();
    const { toCanonicalEmail: canonicalWithExemption } = await import(
      "./emailCanonical"
    );

    expect(canonicalWithExemption("algu+ca@gmail.com")).toBe("algu+ca@gmail.com");
    expect(canonicalWithExemption("algu+es@gmail.com")).toBe("algu+es@gmail.com");
    // els punts continuen ignorant-se igual
    expect(canonicalWithExemption("a.l.g.u+fr@gmail.com")).toBe("algu+fr@gmail.com");
  });

  it("no hauria d'afectar cap altra bústia", async () => {
    process.env.PLUS_ALIAS_EXEMPT_EMAILS = "algu@gmail.com";
    vi.resetModules();
    const { toCanonicalEmail: canonicalWithExemption } = await import(
      "./emailCanonical"
    );

    expect(canonicalWithExemption("altri+prova@gmail.com")).toBe("altri@gmail.com");
  });
});
