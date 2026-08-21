// Tests del service d'autenticació contra una base de dades real en memòria.
//
// Cobreixen les regles que protegeixen el signup, l'establiment de contrasenya
// i el login. Són les que, si es trenquen sense adonar-se'n, obren la porta a
// comptes il·limitats o a entrar sense credencials vàlides.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  startTestDatabase,
  stopTestDatabase,
  clearTestDatabase,
} from "../../test/setupDatabase";
import { signupUser, loginUser, setPassword } from "./service";
import { UserModel } from "./model";
import { updateAppConfig } from "../config/service";
import { toCanonicalEmail } from "../../shared/emailCanonical";
import { env } from "../../config/env";

const IP_HASH = "hash-de-prova";
const PASSWORD = "Contrasenya1";
const SIGNUP_INPUT = {
  name: "Algú",
  useCase: "family" as const,
  useCaseOther: undefined,
};

// Crea directament un usuari amb contrasenya ja establerta, sense passar pel
// flux de correu: els tests de loginUser no necessiten el signup complet.
const createActiveUser = async (email: string, password: string): Promise<void> => {
  await UserModel.create({
    email,
    emailCanonical: toCanonicalEmail(email),
    passwordHash: await bcrypt.hash(password, 12),
    emailVerified: true,
    status: "active",
  });
};

// Signa un token com el que rep /set-password, sense passar pel correu real
const signPasswordToken = (userId: string, type: "verify" | "reset"): string =>
  jwt.sign({ userId, type }, env.JWT_SECRET, { expiresIn: "1h" });

beforeAll(async () => {
  await startTestDatabase();
});

afterAll(async () => {
  await stopTestDatabase();
});

beforeEach(async () => {
  await clearTestDatabase();
});

describe("signupUser", () => {
  it("hauria de crear el compte com a pendent, sense contrasenya", async () => {
    await signupUser({ ...SIGNUP_INPUT, email: "algu@example.com" }, IP_HASH);

    const user = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    expect(user?.status).toBe("pending");
    expect(user?.emailVerified).toBe(false);
    expect(user?.passwordHash).toBeUndefined();
    expect(user?.name).toBe("Algú");
  });

  it("hauria de rebutjar un alias de la mateixa bústia", async () => {
    await signupUser({ ...SIGNUP_INPUT, email: "algu@gmail.com" }, IP_HASH);

    await expect(
      signupUser({ ...SIGNUP_INPUT, email: "a.l.g.u+prova@gmail.com" }, IP_HASH)
    ).rejects.toThrow("EMAIL_ALREADY_EXISTS");
  });

  it("hauria de conservar l'adreça original tal com l'ha escrita l'usuari", async () => {
    await signupUser({ ...SIGNUP_INPUT, email: "A.lgu+feina@gmail.com" }, IP_HASH);

    const user = await UserModel.findOne({ emailCanonical: "algu@gmail.com" });
    // L'email és el que es fa servir per escriure-li: no s'ha de perdre
    expect(user?.email).toBe("a.lgu+feina@gmail.com");
  });

  it("hauria de rebutjar un domini de correu temporal", async () => {
    await expect(
      signupUser({ ...SIGNUP_INPUT, email: "algu@mailinator.com" }, IP_HASH)
    ).rejects.toThrow("DISPOSABLE_EMAIL");
  });

  it("hauria de rebutjar el signup quan el registre està tancat", async () => {
    await updateAppConfig({ registrationOpen: false });

    await expect(
      signupUser({ ...SIGNUP_INPUT, email: "algu@example.com" }, IP_HASH)
    ).rejects.toThrow("REGISTRATION_CLOSED");
  });

  it("hauria de rebutjar el signup en assolir el sostre d'usuaris", async () => {
    await signupUser({ ...SIGNUP_INPUT, email: "primer@example.com" }, IP_HASH);
    await updateAppConfig({ maxUsers: 1 });

    await expect(
      signupUser({ ...SIGNUP_INPUT, email: "segon@example.com" }, IP_HASH)
    ).rejects.toThrow("MAX_USERS_REACHED");
  });

  it("hauria de deixar els comptadors de consum a zero", async () => {
    await signupUser({ ...SIGNUP_INPUT, email: "algu@example.com" }, IP_HASH);

    const user = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    expect(user?.usage.documentsCount).toBe(0);
    expect(user?.usage.storageBytes).toBe(0);
  });
});

describe("setPassword", () => {
  it("hauria d'establir la contrasenya i activar el compte amb un token de verificació", async () => {
    await signupUser({ ...SIGNUP_INPUT, email: "algu@example.com" }, IP_HASH);
    const user = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    const token = signPasswordToken(String(user!._id), "verify");

    const tokens = await setPassword({
      token,
      password: PASSWORD,
      passwordConfirmation: PASSWORD,
    });

    expect(tokens.accessToken).toBeTruthy();

    const updated = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    expect(updated?.passwordHash).toBeTruthy();
    expect(updated?.emailVerified).toBe(true);
    expect(updated?.status).toBe("active");
  });

  it("hauria de substituir la contrasenya i invalidar les sessions amb un token de recuperació", async () => {
    await createActiveUser("algu@example.com", PASSWORD);
    const user = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    const initialVersion = user!.tokenVersion;
    const token = signPasswordToken(String(user!._id), "reset");

    await setPassword({
      token,
      password: "AltraContrasenya2",
      passwordConfirmation: "AltraContrasenya2",
    });

    const updated = await UserModel.findOne({ emailCanonical: "algu@example.com" });
    expect(updated?.tokenVersion).toBe(initialVersion + 1);

    // La contrasenya vella ja no serveix; la nova sí
    await expect(
      loginUser({ email: "algu@example.com", password: PASSWORD }, IP_HASH)
    ).rejects.toThrow("INVALID_CREDENTIALS");

    const tokens = await loginUser(
      { email: "algu@example.com", password: "AltraContrasenya2" },
      IP_HASH
    );
    expect(tokens.accessToken).toBeTruthy();
  });

  it("hauria de rebutjar un token invàlid", async () => {
    await expect(
      setPassword({
        token: "no-es-cap-jwt",
        password: PASSWORD,
        passwordConfirmation: PASSWORD,
      })
    ).rejects.toThrow("VERIFICATION_TOKEN_INVALID");
  });
});

describe("loginUser", () => {
  beforeEach(async () => {
    await createActiveUser("algu@example.com", PASSWORD);
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

  it("hauria de rebutjar el login d'un compte que encara no ha establert contrasenya", async () => {
    await signupUser({ ...SIGNUP_INPUT, email: "novell@example.com" }, IP_HASH);

    await expect(
      loginUser({ email: "novell@example.com", password: PASSWORD }, IP_HASH)
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
