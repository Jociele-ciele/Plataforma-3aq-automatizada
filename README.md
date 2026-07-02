# 3aq Talent — Plataforma de Recrutamento Inteligente

Plataforma web para recrutamento técnico com triagem de currículos por IA, desafios de código, análise de GitHub e ranking automático de candidatos.

**Demonstração online:** [https://talent-frontend-30ro.onrender.com](https://talent-frontend-30ro.onrender.com)

**Repositório:** [https://github.com/Jociele-ciele/Plataforma-3aq-automatizada](https://github.com/Jociele-ciele/Plataforma-3aq-automatizada)

![QR Code do repositório GitHub](./docs/qr-github.png)

---

## Funcionalidades

- Cadastro e login (Recrutador e Candidato)
- Publicação e gestão de vagas
- Candidaturas com upload de currículo
- Triagem automática por IA (compatibilidade currículo × vaga)
- Desafios técnicos com correção em sandbox
- Integração com GitHub do candidato
- Ranking automático por vaga
- Conformidade LGPD (criptografia, auditoria)

---

## Arquitetura

| Serviço    | Tecnologia              | Porta local |
|------------|-------------------------|-------------|
| Frontend   | React + Vite + Tailwind | 5176        |
| Backend    | Node.js + Express + Prisma | 4100     |
| Banco      | PostgreSQL 16           | 5432        |
| IA         | Python + FastAPI        | 8000        |

---

## Contas de teste

| Perfil     | E-mail                 | Senha    |
|------------|------------------------|----------|
| Recrutador | `recrutador@3aq.com`   | `123456` |
| Candidato  | `candidato@3aq.com`    | `123456` |

---

## Rodar localmente (Docker)

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### Passos

```bash
git clone https://github.com/Jociele-ciele/Plataforma-3aq-automatizada.git
cd Plataforma-3aq-automatizada
cp .env.example .env
docker compose up --build
```

### URLs locais

| Serviço  | URL |
|----------|-----|
| Site     | http://localhost:5176 |
| API      | http://localhost:4100/api |
| Swagger  | http://localhost:4100/api/docs |
| IA       | http://localhost:8000 |

---

## Deploy (Render)

O projeto inclui `render.yaml` (Blueprint) com os 4 serviços:

- `talent-frontend` — site (Docker + nginx)
- `talent-backend` — API (Docker)
- `talent-ai` — serviço de IA (Docker)
- `talent-db` — PostgreSQL

1. Conecte o repositório no [Render](https://render.com)
2. Crie um **Blueprint** apontando para `render.yaml`
3. Aplique e aguarde o deploy

> **Plano gratuito:** os serviços dormem após ~15 min sem uso. A primeira visita pode demorar 30–60 segundos.

---

## Estrutura do projeto

```
Plataforma-3aq-automatizada/
├── frontend/          # React (Vite)
├── backend/           # API Node.js + Prisma
├── ai-service/        # Triagem de currículos (FastAPI)
├── docker-compose.yml
├── render.yaml        # Deploy no Render
└── docs/
    └── qr-github.png  # QR Code do repositório
```

---

## Desenvolvimento sem Docker

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### IA

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Licença

Projeto acadêmico — **3aq Tecnologia LTDA** · Projeto Aplicado IV — SENAI SC.
