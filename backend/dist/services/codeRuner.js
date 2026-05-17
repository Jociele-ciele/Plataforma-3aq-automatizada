"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJavascriptChallenge = runJavascriptChallenge;
const node_vm_1 = __importDefault(require("node:vm"));
/**
  Executa código JavaScript do candidato num contexto isolado com timeout
 O candidato deve definir: function solution(input) { ... }
 Em produção, usar sandbox/container dedicado (ex.:Judge0, Firecracker).
 */
function runJavascriptChallenge(userCode, testCases, timeLimitMs) {
    const details = [];
    let passed = 0;
    const total = testCases.length;
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const inputJson = JSON.stringify(tc.input);
        const wrapped = `
      ${userCode}
      (function() {
        if (typeof solution !== 'function') throw new Error('solution não é uma função');
        return solution(${inputJson});
      })();
    `;
        try {
            const result = node_vm_1.default.runInNewContext(wrapped, Object.create(null), {
                timeout: timeLimitMs,
            });
            const ok = deepEqual(result, tc.expected);
            if (ok) {
                passed += 1;
                details.push(`Caso ${i + 1}: passou`);
            }
            else {
                details.push(`Caso ${i + 1}: falhou — obtido ${JSON.stringify(result)}, esperado ${JSON.stringify(tc.expected)}`);
            }
        }
        catch (e) {
            details.push(`Caso ${i + 1}: erro — ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    const scorePercent = total === 0 ? 0 : Math.round((passed / total) * 10000) / 100;
    return { passed, total, details, scorePercent };
}
function deepEqual(a, b) {
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    if (a === null || b === null)
        return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length)
            return false;
        return a.every((v, i) => deepEqual(v, b[i]));
    }
    if (typeof a === "object" && typeof b === "object") {
        const ak = Object.keys(a).sort();
        const bk = Object.keys(b).sort();
        if (ak.length !== bk.length)
            return false;
        return ak.every((k) => deepEqual(a[k], b[k]));
    }
    return false;
}
//# sourceMappingURL=codeRuner.js.map