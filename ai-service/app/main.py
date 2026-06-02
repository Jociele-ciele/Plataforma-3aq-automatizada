"""
Serviço de IA do 3aq Talent
Lê o texto de um currículo e devolve uma nota de compatibilidade com a vaga.
Usa TF-IDF + similaridade do cosseno (scikit-learn) — leve e gratuito.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import triagem, health

app = FastAPI(
    title="3aq Talent — Serviço de IA",
    description="Triagem automática de currículos com IA",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(triagem.router)


@app.get("/")
def root():
    return {
        "service": "3aq Talent IA",
        "docs": "/docs",
        "endpoints": ["/health", "/triagem"],
    }
