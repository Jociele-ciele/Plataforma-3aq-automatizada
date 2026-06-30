/**
 * Definições OpenAPI (swagger-jsdoc) — mantidas separadas das rotas.
 */

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Healthcheck da API
 *     responses:
 *       200:
 *         description: Serviço disponível
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 service: { type: string, example: 3aq-talent-backend }
 *                 env: { type: string, example: development }
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Criar conta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterBody'
 *     responses:
 *       201:
 *         description: Conta criada
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       200:
 *         description: Tokens JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: Credenciais inválidas
 */

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshBody'
 *     responses:
 *       200:
 *         description: Novo par de tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 */

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Encerrar sessão (invalida refresh token)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshBody'
 *     responses:
 *       200:
 *         description: Logout realizado
 */

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Usuário autenticado (sessão)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autenticado
 */

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Perfil completo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *   put:
 *     tags: [Users]
 *     summary: Atualizar perfil
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileBody'
 *     responses:
 *       200:
 *         description: Perfil atualizado
 */

/**
 * @openapi
 * /api/users/me/export:
 *   get:
 *     tags: [Users]
 *     summary: Exportar dados (LGPD)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: JSON com todos os dados do usuário
 */

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Excluir conta (LGPD)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta excluída
 */

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: Listar vagas abertas (público)
 *     responses:
 *       200:
 *         description: Lista de vagas
 *   post:
 *     tags: [Jobs]
 *     summary: Criar vaga
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobBody'
 *     responses:
 *       201:
 *         description: Vaga criada
 */

/**
 * @openapi
 * /api/jobs/mine:
 *   get:
 *     tags: [Jobs]
 *     summary: Vagas do recrutador logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vagas do recrutador
 */

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Detalhes de uma vaga
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vaga encontrada
 *       404:
 *         description: Vaga não encontrada
 *   put:
 *     tags: [Jobs]
 *     summary: Atualizar vaga
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobBody'
 *     responses:
 *       200:
 *         description: Vaga atualizada
 *   delete:
 *     tags: [Jobs]
 *     summary: Remover vaga
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vaga removida
 */

/**
 * @openapi
 * /api/jobs/{id}/close:
 *   post:
 *     tags: [Jobs]
 *     summary: Encerrar vaga
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vaga encerrada
 */

/**
 * @openapi
 * /api/resumes:
 *   post:
 *     tags: [Resumes]
 *     summary: Enviar currículo (PDF)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [curriculo]
 *             properties:
 *               curriculo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo PDF (máx. 5 MB)
 *     responses:
 *       201:
 *         description: Currículo enviado e analisado
 *   get:
 *     tags: [Resumes]
 *     summary: Histórico de currículos do candidato
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de currículos
 */

/**
 * @openapi
 * /api/resumes/last:
 *   get:
 *     tags: [Resumes]
 *     summary: Último currículo enviado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Currículo mais recente
 */

/**
 * @openapi
 * /api/resumes/{id}/download:
 *   get:
 *     tags: [Resumes]
 *     summary: Baixar PDF do currículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Arquivo PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @openapi
 * /api/challenges:
 *   post:
 *     tags: [Challenges]
 *     summary: Criar desafio técnico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChallengeBody'
 *     responses:
 *       201:
 *         description: Desafio criado
 */

/**
 * @openapi
 * /api/challenges/by-job/{vagaId}:
 *   get:
 *     tags: [Challenges]
 *     summary: Desafios de uma vaga
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vagaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de desafios
 */

/**
 * @openapi
 * /api/challenges/{id}:
 *   get:
 *     tags: [Challenges]
 *     summary: Detalhes do desafio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Desafio encontrado
 *   delete:
 *     tags: [Challenges]
 *     summary: Remover desafio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Desafio removido
 */

/**
 * @openapi
 * /api/challenges/{id}/submit:
 *   post:
 *     tags: [Challenges]
 *     summary: Enviar resposta ao desafio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitChallengeBody'
 *     responses:
 *       200:
 *         description: Resposta avaliada
 */

/**
 * @openapi
 * /api/applications/mine:
 *   get:
 *     tags: [Applications]
 *     summary: Minhas inscrições (candidato)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inscrições
 */

/**
 * @openapi
 * /api/applications/by-job/{vagaId}:
 *   get:
 *     tags: [Applications]
 *     summary: Inscrições de uma vaga (recrutador)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vagaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de candidatos inscritos
 */

/**
 * @openapi
 * /api/applications/{id}:
 *   get:
 *     tags: [Applications]
 *     summary: Detalhes da inscrição
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Inscrição com notas e currículo
 */

/**
 * @openapi
 * /api/applications/job/{vagaId}:
 *   post:
 *     tags: [Applications]
 *     summary: Inscrever-se em uma vaga
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vagaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Inscrição criada
 */

/**
 * @openapi
 * /api/applications/{id}/status:
 *   put:
 *     tags: [Applications]
 *     summary: Atualizar status da inscrição
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationStatusBody'
 *     responses:
 *       200:
 *         description: Status atualizado
 */

/**
 * @openapi
 * /api/applications/{id}/refresh-score:
 *   post:
 *     tags: [Applications]
 *     summary: Recalcular nota final da inscrição
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Nota recalculada
 */

/**
 * @openapi
 * /api/github/analisar:
 *   post:
 *     tags: [GitHub]
 *     summary: Analisar perfil GitHub
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GitHubAnalisarBody'
 *     responses:
 *       200:
 *         description: Métricas do perfil
 */

/**
 * @openapi
 * /api/github/me:
 *   get:
 *     tags: [GitHub]
 *     summary: Última análise GitHub do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados da análise
 */

/**
 * @openapi
 * /api/ranking/job/{vagaId}:
 *   get:
 *     tags: [Ranking]
 *     summary: Ranking de candidatos por vaga
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vagaId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista ordenada por nota
 */

/**
 * @openapi
 * /api/ranking/dashboard/recrutador:
 *   get:
 *     tags: [Ranking]
 *     summary: Dashboard do recrutador
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas e resumos
 */

/**
 * @openapi
 * /api/ranking/dashboard/candidato:
 *   get:
 *     tags: [Ranking]
 *     summary: Dashboard do candidato
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas e resumos
 */

export {};
