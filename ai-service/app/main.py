"""Serviço de triagem de CV — protótipo transparente e explicável (sem modelo externo obrigatório)."""

from __future__ import annotations

import math
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


class AnalyzeCvRequest(BaseModel):
    text: str = Field(..., min_length=10)
    job_keywords: list[str] = Field(default_factory=list)


class AnalyzeCvResponse(BaseModel):
    technical_score: float = Field(..., ge=0, le=100, description="Pontuação técnica objetiva no texto")
    fit_score: float = Field(..., ge=0, le=100, description="Adequação às palavras-chave da vaga")
    summary: str
    matched_keywords: list[str]


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
    # Penaliza textos muito curtos
    if len(t) < 120:
        score *= 0.7
    return max(0.0, min(100.0, score))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "talent-ai"}


@app.post("/analyze-cv", response_model=AnalyzeCvResponse)
def analyze_cv(body: AnalyzeCvRequest) -> dict[str, Any]:
    """Classifica CV com critérios fixos (RN01) — combinável com LLM em produção dentro do orçamento."""
    kws = [k for k in body.job_keywords if k and str(k).strip()]
    if not kws:
        kws = ["javascript", "react", "node"]

    hits = _keyword_hits(body.text, kws)
    fit = (len(hits) / max(1, len(kws))) * 100
    # Pequeno bónus se o texto for longo e estruturado
    fit = min(100.0, fit * 0.85 + min(15.0, len(body.text) / 400))

    tech = _technical_density(body.text)
    summary = (
        f"Correspondência explícita com stack da vaga: {', '.join(hits) or 'nenhuma keyword directa'}. "
        f"Densidade de termos técnicos estimada no texto."
    )
    return {
        "technical_score": round(tech, 2),
        "fit_score": round(fit, 2),
        "summary": summary,
        "matched_keywords": hits,
    }


@app.get("/")
def root() -> dict[str, str]:
    return {"docs": "/docs"}
