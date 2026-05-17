"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analisarTextoCV = analisarTextoCV;
const config_js_1 = require("../config.js");
async function analisarTextoCV(texto, palavrasChaveVaga) {
    const url = `${config_js_1.config.aiServiceUrl.replace(/\/$/, "")}/analyze-cv`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            texto,
            palavras_chave_vaga: palavrasChaveVaga,
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Serviço de IA indisponível: ${res.status} ${err}`);
    }
    return (await res.json());
}
//# sourceMappingURL=aiClient.js.map