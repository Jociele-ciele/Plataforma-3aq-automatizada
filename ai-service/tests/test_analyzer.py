from app.services.analyzer import analisar_curriculo


def test_score_tecnico_alto():
    r = analisar_curriculo(
        texto="Sou desenvolvedora React, Node.js e PostgreSQL com 3 anos.",
        tecnologias=["React", "Node.js", "PostgreSQL"],
        titulo="Dev Full-Stack",
        descricao="vaga para full-stack",
    )
    assert r["scoreTecnico"] == 100.0
    assert "React" in r["palavrasEncontradas"]


def test_score_zero_quando_nada_combina():
    r = analisar_curriculo(
        texto="Curso de jardinagem e culinária italiana.",
        tecnologias=["Java", "Spring"],
        titulo="Backend Java",
        descricao="precisamos de pessoa Java",
    )
    assert r["scoreTecnico"] == 0.0


def test_resumo_nao_quebra_com_texto_curto():
    r = analisar_curriculo(
        texto="Olá!",
        tecnologias=["React"],
        titulo="x",
        descricao="y",
    )
    assert isinstance(r["resumo"], str) and len(r["resumo"]) > 0
