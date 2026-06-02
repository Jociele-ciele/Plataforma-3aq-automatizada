import { describe, it, expect } from "vitest";
import { rodarCodigo } from "../src/modules/challenges/sandbox";

describe("Sandbox node:vm", () => {
  it("retorna 100 quando todos os testes passam", () => {
    const codigo = `function solve(arr){ return arr.reduce((a,b)=>a+b,0); }`;
    const r = rodarCodigo(codigo, [
      { entrada: [[1, 2, 3]], saidaEsperada: 6 },
      { entrada: [[]], saidaEsperada: 0 },
    ]);
    expect(r.nota).toBe(100);
    expect(r.passados).toBe(2);
  });

  it("retorna 0 quando nenhum teste passa", () => {
    const codigo = `function solve(){ return -1; }`;
    const r = rodarCodigo(codigo, [{ entrada: [[1]], saidaEsperada: 1 }]);
    expect(r.nota).toBe(0);
  });

  it("avisa quando o código não declara solve", () => {
    const r = rodarCodigo(`const x = 1;`, [{ entrada: [], saidaEsperada: 1 }]);
    expect(r.erroSintaxe).toBeDefined();
    expect(r.nota).toBe(0);
  });

  it("captura erro de execução sem travar o servidor", () => {
    const codigo = `function solve(){ throw new Error('boom'); }`;
    const r = rodarCodigo(codigo, [{ entrada: [], saidaEsperada: 1 }]);
    expect(r.passados).toBe(0);
    expect(r.resultados[0].erro).toContain("boom");
  });

  it("respeita o timeout em loop infinito", () => {
    const codigo = `function solve(){ while(true){} }`;
    const r = rodarCodigo(codigo, [{ entrada: [], saidaEsperada: 1 }]);
    expect(r.passados).toBe(0);
    expect(r.resultados[0].erro).toBeDefined();
  }, 8000);
});