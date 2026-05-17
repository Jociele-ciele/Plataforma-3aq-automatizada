export type TestCase = {
    input: unknown;
    expected: unknown;
};
export type RunResult = {
    passed: number;
    total: number;
    details: string[];
    scorePercent: number;
};
/**
  Executa código JavaScript do candidato num contexto isolado com timeout
 O candidato deve definir: function solution(input) { ... }
 Em produção, usar sandbox/container dedicado (ex.:Judge0, Firecracker).
 */
export declare function runJavascriptChallenge(userCode: string, testCases: TestCase[], timeLimitMs: number): RunResult;
//# sourceMappingURL=codeRuner.d.ts.map