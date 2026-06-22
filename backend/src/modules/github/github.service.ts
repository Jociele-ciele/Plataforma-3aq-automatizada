import { prisma } from "../../config/prisma";
import { AppError, NotFoundError } from "../../utils/errors";

type GithubUser = {
  public_repos: number;
  followers: number;
};

type GithubRepo = {
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
};

function normalizarUsername(github: string): string {
  const trimmed = github.trim();
  const match = trimmed.match(/github\.com\/([^/?#]+)/i);
  return (match?.[1] ?? trimmed).replace(/^@/, "");
}

function headersGitHub(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function buscarDadosGithub(username: string) {
  const headers = headersGitHub();

  const userRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}`,
    { headers }
  );
  if (!userRes.ok) {
    throw new AppError("Usuário do GitHub não encontrado ou limite da API atingido", 502);
  }

  const user = (await userRes.json()) as GithubUser;

  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=pushed`,
    { headers }
  );
  if (!reposRes.ok) {
    throw new AppError("Falha ao buscar repositórios do GitHub", 502);
  }

  const repos = (await reposRes.json()) as GithubRepo[];
  const contagemLinguagens = new Map<string, number>();
  let atividade = 0;
  let estrelas = 0;
  let ultimaAtividade: Date | null = null;
  const agora = Date.now();

  for (const repo of repos) {
    estrelas += repo.stargazers_count;
    if (repo.language) {
      contagemLinguagens.set(
        repo.language,
        (contagemLinguagens.get(repo.language) ?? 0) + 1
      );
    }
    const pushed = new Date(repo.pushed_at);
    if (!ultimaAtividade || pushed > ultimaAtividade) ultimaAtividade = pushed;
    if (agora - pushed.getTime() < 180 * 24 * 60 * 60 * 1000) atividade += 1;
  }

  const tecnologias = [...contagemLinguagens.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([nome]) => nome);

  const pontuacaoPortfolio = Math.min(
    100,
    user.public_repos * 4 + atividade * 5 + tecnologias.length * 3
  );
  const pontuacaoAtividade = Math.min(100, atividade * 12);
  const score = Math.min(
    100,
    Math.round((pontuacaoPortfolio + pontuacaoAtividade) / 2)
  );

  return {
    username,
    score,
    repositorios: user.public_repos,
    estrelas,
    seguidores: user.followers,
    tecnologias,
    ultimaAtividade,
  };
}

export const githubService = {
  async analisarUsuario(candidatoId: string, github: string) {
    const username = normalizarUsername(github);
    if (!username) throw new AppError("Informe um usuário do GitHub válido", 400);

    const dados = await buscarDadosGithub(username);

    await prisma.user.update({
      where: { id: candidatoId },
      data: { github: username },
    });

    return prisma.githubAnalysis.upsert({
      where: { candidatoId },
      create: { candidatoId, ...dados },
      update: dados,
    });
  },

  async getByUserId(candidatoId: string) {
    const analise = await prisma.githubAnalysis.findUnique({ where: { candidatoId } });
    if (!analise) throw new NotFoundError("Análise do GitHub ainda não foi feita");
    return analise;
  },
};
