from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List

from app.services.analyzer import analisar_curriculo

router = APIRouter(tags=["triagem"])


class TriagemRequest(BaseModel):
    texto: str = Field(..., description="Texto extraído do currículo")
    tecnologias: List[str] = Field(..., description="Tecnologias exigidas pela vaga")
    tituloVaga: str
    descricao: str


class TriagemResponse(BaseModel):
    scoreTecnico: float
    scoreAderencia: float
    palavrasEncontradas: List[str]
    palavrasFaltantes: List[str]
    resumo: str


@router.post("/triagem", response_model=TriagemResponse)
def triagem(req: TriagemRequest) -> TriagemResponse:
    resultado = analisar_curriculo(
        texto=req.texto,
        tecnologias=req.tecnologias,
        titulo=req.tituloVaga,
        descricao=req.descricao,
    )
    return TriagemResponse(**resultado)
