// Tests del service d'autenticació contra una base de dades real en memòria.
//
// Cobreixen les regles que protegeixen el registre i el login. Són les que, si
// es trenquen sense adonar-se'n, obren la porta a comptes il·limitats.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  startTestDatabase,
  stopTestDatabase,
  clearTestDatabase,
} from "../../test/setupDatabase";
import { registerUser, loginUser } from "./service";
import { UserModel } from "./model";
import { updateAppConfig } from "../config/service";

const IP_HASH = "hash-de-prova";
const PASSWORD = "contrasenya-segura";

beforeAll(async () => {
  await startTestDatabase();
});

afterAll(async () => {
  await stopTestDatabase();
});

beforeEach(async () => {
  await clearTestDatabase();
});

describe("registerUser", () => {
  it("hauria de crear el compte com a pendent de verificar", async () => {
    await registerUser({ email: "algu@example.com", password: PASSWORD }, IP_HASH);

    const user = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    expect(user?.status).toBe("pending");
    expect(user?.emailVerified).toBe(false);
  });

  it("hauria de rebutjar un alias de la mateixa bústia", async () => {
    await registerUser({ email: "algu@gmail.com", password: PASSWORD }, IP_HASH);

    await expect(
      registerUser({ email: "a.l.g.u+prova@gmail.com", password: PASSWORD }, IP_HASH)
    ).rejects.toThrow("EMAIL_ALREADY_EXISTS");
  });

  it("hauria de conservar l'adreça original tal com l'ha escrita l'usuari", async () => {
    await registerUser({ email: "A.lgu+feina@gmail.com", password: PASSWORD }, IP_HASH);

    const user = await UserModel.findOne({ emailCanonical: "algu@gmail.com" });
    // L'email és el que es fa servir per escriure-li: no s'ha de perdre
    expect(user?.email).toBe("a.lgu+feina@gmail.com");
  });

  it("hauria de rebutjar un domini de correu temporal", async () => {
    await expect(
      registerUser({ email: "algu@mailinator.com", password: PASSWORD }, IP_HASH)
    ).rejects.toThrow("DISPOSABLE_EMAIL");
  });

  it("hauria de rebutjar el registre quan està tancat", async () => {
    await updateAppConfig({ registrationOpen: false });

    await expect(
      registerUser({ email: "algu@example.com", password: PASSWORD }, IP_HASH)
    ).rejects.toThrow("REGISTRATION_CLOSED");
  });

  it("hauria de rebutjar el registre en assolir el sostre d'usuaris", async () => {
    await registerUser({ email: "primer@example.com", password: PASSWORD }, IP_HASH);
    await updateAppConfig({ maxUsers: 1 });

    await expect(
      registerUser({ email: "segon@example.com", password: PASSWORD }, IP_HASH)
    ).rejects.toThrow("MAX_USERS_REACHED");
  });

  it("hauria de deixar els comptadors de consum a zero", async () => {
    await registerUser({ email: "algu@example.com", password: PASSWORD }, IP_HASH);

    const user = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    expect(user?.usage.documentsCount).toBe(0);
    expect(user?.usage.storageBytes).toBe(0);
  });
});

describe("loginUser", () => {
  beforeEach(async () => {
    await registerUser({ email: "algu@example.com", password: PASSWORD }, IP_HASH);
  });

  it("hauria de retornar tokens amb les credencials correctes", async () => {
    const tokens = await loginUser(
      { email: "algu@example.com", password: PASSWORD },
      IP_HASH
    );

    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
  });

  it("hauria d'acceptar el login escrivint l'adreça amb un alias", async () => {
    // Qui s'ha registrat amb punts o "+" ha de poder entrar igualment
    const tokens = await loginUser(
      { email: "ALGU@example.com", password: PASSWORD },
      IP_HASH
    );

    expect(tokens.accessToken).toBeTruthy();
  });

  it("hauria de donar el mateix error amb un correu inexistent que amb una contrasenya errònia", async () => {
    // Si els errors es distingissin, es podrien enumerar els comptes registrats
    await expect(
      loginUser({ email: "ningu@example.com", password: PASSWORD }, IP_HASH)
    ).rejects.toThrow("INVALID_CREDENTIALS");

    await expect(
      loginUser({ email: "algu@example.com", password: "incorrecta" }, IP_HASH)
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("hauria de bloquejar el compte després de cinc intents fallits", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        loginUser({ email: "algu@example.com", password: "incorrecta" }, IP_HASH)
      ).rejects.toThrow("INVALID_CREDENTIALS");
    }

    const user = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    expect(user?.lockUntil).toBeDefined();

    // Amb el compte bloquejat, ni la contrasenya bona hi entra
    await expect(
      loginUser({ email: "algu@example.com", password: PASSWORD }, IP_HASH)
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("hauria de netejar els intents fallits després d'un login correcte", async () => {
    await expect(
      loginUser({ email: "algu@example.com", password: "incorrecta" }, IP_HASH)
    ).rejects.toThrow("INVALID_CREDENTIALS");

    await loginUser({ email: "algu@example.com", password: PASSWORD }, IP_HASH);

    const user = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    expect(user?.failedLoginAttempts).toBe(0);
    expect(user?.lastLoginAt).toBeDefined();
  });

  it("hauria de rebutjar l'entrada a un compte suspès", async () => {
    await UserModel.updateOne(
      { emailCanonical: "algu@example.com" },
      { $set: { status: "suspended" } }
    );

    await expect(
      loginUser({ email: "algu@example.com", password: PASSWORD }, IP_HASH)
    ).rejects.toThrow("ACCOUNT_SUSPENDED");
  });
});
