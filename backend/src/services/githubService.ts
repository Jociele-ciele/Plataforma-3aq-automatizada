import { config } from "../config.js";

export type AnaliseGithub = {
  login: string;
  repos_publicos: number;
  linguagens_principais: { nome: string; quantidade: number }[];
  pontuacao_atividade: number;
  pontuacao_portfolio: number;
};

type Repo = {
  language: string | null;
  pushed_at: string;
};

export async function analisarGithubPublico(
  login: string,
): Promise<AnaliseGithub> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (config.githubToken) {
    headers.Authorization = `Bearer ${config.githubToken}`;
  }

  const userRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}`,
    { headers },
  );
  if (!userRes.ok) {
    throw new Error("GitHub: utilizador não encontrado ou limite de API");
  }

  const user = (await userRes.json()) as { public_repos: number };
  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=30&sort=pushed`,
    { headers },
  );
  if (!reposRes.ok) {
    throw new Error("GitHub: falha ao listar repositórios");
  }

  const repos = (await reposRes.json()) as Repo[];
  const contagemLinguagens = new Map<string, number>();
  let atividade = 0;
  const agora = Date.now();

  for (const repo of repos) {
    if (repo.language) {
      contagemLinguagens.set(
        repo.language,
        (contagemLinguagens.get(repo.language) ?? 0) + 1,
      );
    }
    const pushed = new Date(repo.pushed_at).getTime();
    if (agora - pushed < 180 * 24 * 60 * 60 * 1000) {
      atividade += 1;
    }
  }

  const linguagens_principais = [...contagemLinguagens.entries()]
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  const pontuacao_portfolio = Math.min(
    100,
    user.public_repos * 4 + atividade * 5 + linguagens_principais.length * 3,
  );
  const pontuacao_atividade = Math.min(100, atividade * 12);

  return {
    login,
    repos_publicos: user.public_repos,
    linguagens_principais,
    pontuacao_atividade,
    pontuacao_portfolio,
  };
}
