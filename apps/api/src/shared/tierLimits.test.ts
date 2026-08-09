// Tests dels límits per pla

import { describe, it, expect } from "vitest";
import { resolveQuotaLimits, TIER_LIMITS } from "./tierLimits";

describe("resolveQuotaLimits", () => {
  it("hauria de retornar els límits del pla quan no hi ha excepcions", () => {
    expect(resolveQuotaLimits("free")).toEqual(TIER_LIMITS.free);
  });

  it("hauria de deixar que l'excepció mani sobre el límit del pla", () => {
    const limits = resolveQuotaLimits("free", { documents: 500 });
    expect(limits.documents).toBe(500);
  });

  it("hauria de conservar la resta de límits en aplicar una excepció parcial", () => {
    const limits = resolveQuotaLimits("free", { documents: 500 });
    expect(limits.storageBytes).toBe(TIER_LIMITS.free.storageBytes);
  });
});
