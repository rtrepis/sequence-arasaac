import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  API_ERROR_CODES,
  API_ERROR_CODES_WITHOUT_TEXT,
  CLIENT_ERROR_CODES,
  ERROR_CODES_WITH_TEXT,
  errorMessageFor,
  isApiErrorCode,
} from "./errors";

const errorsCatalog = JSON.parse(
  readFileSync(join(__dirname, "..", "messages", "errors", "ca.json"), "utf8"),
) as Record<string, unknown>;

describe("codis d'error", () => {
  it("cada codi amb text en té al catàleg, i el catàleg no en té cap més", () => {
    const expected = ERROR_CODES_WITH_TEXT.map((code) => `error.${code}`).sort();
    expect(Object.keys(errorsCatalog).sort()).toEqual(expected);
  });

  it("cap codi no és alhora de l'API i del front", () => {
    const api: readonly string[] = API_ERROR_CODES;
    expect(CLIENT_ERROR_CODES.filter((code) => api.includes(code))).toEqual([]);
  });

  it("els codis sense text són codis de l'API", () => {
    expect(API_ERROR_CODES_WITHOUT_TEXT.every((code) => isApiErrorCode(code))).toBe(true);
  });

  it("un codi desconegut o sense text cau al genèric del context", () => {
    expect(errorMessageFor("INVALID_CREDENTIALS", "AUTH_ERROR")).toEqual({
      id: "error.INVALID_CREDENTIALS",
    });
    expect(errorMessageFor("FORBIDDEN", "AUTH_ERROR")).toEqual({ id: "error.AUTH_ERROR" });
    expect(errorMessageFor("HTTP_502", "UNKNOWN_ERROR")).toEqual({ id: "error.UNKNOWN_ERROR" });
    expect(errorMessageFor(null, "UNKNOWN_ERROR")).toEqual({ id: "error.UNKNOWN_ERROR" });
  });
});
