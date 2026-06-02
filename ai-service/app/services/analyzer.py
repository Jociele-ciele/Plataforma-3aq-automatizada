"""
Núcleo da IA de triagem.

Estratégia (simples e gratuita):
  1. Normaliza o texto do currículo (minúsculas, remove acentos, etc).
  2. Calcula `scoreTecnico` -> quantas tecnologias exigidas estão no currículo.
  3. Calcula `scoreAderencia` -> similaridade TF-IDF entre o currículo e o
     texto da vaga (título + descrição + tecnologias).
  4. Gera um pequeno resumo automático com as 3 frases mais relevantes.
"""
import re
import unicodedata
from typing import Dict, List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _normalizar(texto: str) -> str:
    sem_acentos = unicodedata.normalize("NFKD", texto)
    sem_acentos = "".join(c for c in sem_acentos if not unicodedata.combining(c))
    return sem_acentos.lower()


def _tecnologias_no_texto(texto: str, tecnologias: List[str]) -> List[str]:
    norm_texto = _normalizar(texto)
    encontradas = []
    for tec in tecnologias:
        if _normalizar(tec) in norm_texto:
            encontradas.append(tec)
    return encontradas


def _similaridade_tfidf(curriculo: str, vaga_texto: str) -> float:
    try:
        vec = TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            stop_words=None,
        )
        matriz = vec.fit_transform([curriculo, vaga_texto])
        sim = cosine_similarity(matriz[0:1], matriz[1:2])[0][0]
        return float(sim)
    except ValueError:
        return 0.0


def _gerar_resumo(texto: str, palavras_chave: List[str], limite_frases: int = 3) -> str:
    frases = re.split(r"(?<=[.!?])\s+", texto)
    frases = [f.strip() for f in frases if 20 <= len(f.strip()) <= 240]
    if not frases:
        return texto[:200].strip() + ("…" if len(texto) > 200 else "")

    chaves = [_normalizar(p) for p in palavras_chave]
    pontuadas = []
    for f in frases:
        n = _normalizar(f)
        score = sum(1 for c in chaves if c in n)
        pontuadas.append((score, f))

    top = sorted(pontuadas, key=lambda x: x[0], reverse=True)[:limite_frases]
    if all(s == 0 for s, _ in top):
        top = [(0, f) for f in frases[:limite_frases]]
    return " ".join(f for _, f in top)


def analisar_curriculo(
    texto: str,
    tecnologias: List[str],
    titulo: str,
    descricao: str,
) -> Dict:
    texto = texto or ""
    encontradas = _tecnologias_no_texto(texto, tecnologias)
    faltantes = [t for t in tecnologias if t not in encontradas]

    score_tecnico = (
        round((len(encontradas) / max(len(tecnologias), 1)) * 100, 2)
        if tecnologias
        else 0.0
    )

    vaga_texto = " ".join([titulo, descricao, " ".join(tecnologias)])
    sim = _similaridade_tfidf(texto, vaga_texto)
    score_aderencia = round(min(max(sim * 120, 0), 100), 2)
    score_aderencia = round((score_aderencia * 0.6) + (score_tecnico * 0.4), 2)

    resumo = _gerar_resumo(texto, tecnologias + titulo.split())

    return {
        "scoreTecnico": score_tecnico,
        "scoreAderencia": score_aderencia,
        "palavrasEncontradas": encontradas,
        "palavrasFaltantes": faltantes,
        "resumo": resumo or "Não foi possível gerar resumo automático.",
    }
