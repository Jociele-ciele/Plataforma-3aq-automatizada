import { describe, it, expect } from "vitest";
import { cn, formatDate, initials, formatNumber } from "@/lib/utils";

describe("utils", () => {
  it("cn merge sem duplicar classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("initials pega 2 iniciais", () => {
    expect(initials("Jociele Siqueira da Silva")).toBe("JS");
  });
  it("formatDate em pt-BR", () => {
    const r = formatDate("2026-03-08T00:00:00Z");
    expect(r).toMatch(/2026/);
  });
  it("formatNumber com separador", () => {
    expect(formatNumber(1234)).toBe("1.234");
  });
});
