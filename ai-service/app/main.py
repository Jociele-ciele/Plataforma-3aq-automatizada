"""Serviço de triagem de CV — protótipo transparente e explicável (sem modelo externo obrigatório)."""

from __future__ import annotations

import re
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Talent IA — Triagem de CV", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalisarCvPedido(BaseModel):
    texto: str = Field(..., min_length=10)
    palavras_chave_vaga: list[str] = Field(default_factory=list)


class AnalisarCvResposta(BaseModel):
    nota_tecnica: float = Field(..., ge=0, le=100)
    nota_compatibilidade: float = Field(..., ge=0, le=100)
    resumo: str
    palavras_chave_encontradas: list[str]


def _normalize(txt: str) -> str:
    return re.sub(r"\s+", " ", txt.lower().strip())


def _keyword_hits(text: str, keywords: list[str]) -> list[str]:
    t = _normalize(text)
    hits: list[str] = []
    for kw in keywords:
        if not kw:
            continue
        k = kw.strip().lower()
        if len(k) >= 2 and k in t:
            hits.append(kw.strip())
    return sorted(set(hits))


def _technical_density(text: str) -> float:
    t = _normalize(text)
    patterns = [
        r"\b(javascript|typescript|react|node|express|nest|python|fastapi|django|sql|postgres|git|docker|api|rest|graphql|testes?|tdd|ci/cd)\b",
        r"\b(scrum|agile|kanban)\b",
        r"\b(\d+)\s*(anos?|years?)\b",
    ]
    score = 0.0
    for p in patterns:
        score += min(12, len(re.findall(p, t)) * 4)
    if len(t) < 120:
        score *= 0.7
    return max(0.0, min(100.0, score))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "servico": "talent-ai"}


@app.post("/analyze-cv", response_model=AnalisarCvResposta)
def analyze_cv(body: AnalisarCvPedido) -> dict[str, Any]:
    kws = [k for k in body.palavras_chave_vaga if k and str(k).strip()]
    if not kws:
        kws = ["javascript", "react", "node"]

    hits = _keyword_hits(body.texto, kws)
    fit = (len(hits) / max(1, len(kws))) * 100
    fit = min(100.0, fit * 0.85 + min(15.0, len(body.texto) / 400))

    tech = _technical_density(body.texto)
    resumo = (
        f"Correspondência explícita com stack da vaga: {', '.join(hits) or 'nenhuma keyword directa'}. "
        f"Densidade de termos técnicos estimada no texto."
    )
    return {
        "nota_tecnica": round(tech, 2),
        "nota_compatibilidade": round(fit, 2),
        "resumo": resumo,
        "palavras_chave_encontradas": hits,
    }


@app.get("/")
def root() -> dict[str, str]:
    return {"docs": "/docs"}
