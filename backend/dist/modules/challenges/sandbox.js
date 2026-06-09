"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rodarCodigo = rodarCodigo;
const node_vm_1 = __importDefault(require("node:vm"));
const TIMEOUT_MS = 3000;
// Roda código JavaScript do candidato em ambiente isolado.
// Espera que o código exporte uma função chamada `solve` ou seja a última expressão.
function rodarCodigo(codigo, casos) {
    const resultados = [];
    let solve = null;
    try {
        const wrapper = `(() => { ${codigo}\n; return typeof solve !== 'undefined' ? solve : null; })()`;
        const script = new node_vm_1.default.Script(wrapper);
        const context = node_vm_1.default.createContext(Object.create(null));
        solve = script.runInContext(context, { timeout: TIMEOUT_MS });
        if (typeof solve !== "function") {
            return {
                resultados: [],
                totalCasos: casos.length,
                passados: 0,
                nota: 0,
                erroSintaxe: "Sua submissão precisa declarar uma função `function solve(...)` que retorne o resultado.",
            };
        }
    }
    catch (e) {
        return {
            resultados: [],
            totalCasos: casos.length,
            passados: 0,
            nota: 0,
            erroSintaxe: e.message,
        };
    }
    let passados = 0;
    for (const caso of casos) {
        const inicio = performance.now();
        try {
            const recebido = node_vm_1.default.runInNewContext("solve.apply(null, args)", { solve, args: caso.entrada }, { timeout: TIMEOUT_MS });
            const passou = JSON.stringify(recebido) === JSON.stringify(caso.saidaEsperada);
            if (passou)
                passados++;
            resultados.push({
                passou,
                entrada: caso.entrada,
                esperado: caso.saidaEsperada,
                recebido,
                tempoMs: Math.round(performance.now() - inicio),
            });
        }
        catch (e) {
            resultados.push({
                passou: false,
                entrada: caso.entrada,
                esperado: caso.saidaEsperada,
                recebido: null,
                erro: e.message,
                tempoMs: Math.round(performance.now() - inicio),
            });
        }
    }
    const total = casos.length || 1;
    return {
        resultados,
        totalCasos: casos.length,
        passados,
        nota: Math.round((passados / total) * 100),
    };
}
//# sourceMappingURL=sandbox.js.map