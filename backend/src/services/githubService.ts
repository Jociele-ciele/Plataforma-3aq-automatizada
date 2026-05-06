import { config } from "../config.js";

export type GithubAnalysis = {
  login: string;
  publicRepos: number;
  topLanguages: { name: string; count: number }[];
  recentActivityScore: number;
  portfolioScore: number;
};

type Repo = {
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
};

export async function analyzeGithubPublic(login: string): Promise<GithubAnalysis> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (config.githubToken) headers.Authorization = `Bearer ${config.githubToken}`;

  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, { headers });
  if (!userRes.ok) throw new Error(`GitHub: utilizador não encontrado ou limite de API`);

  const user = (await userRes.json()) as { public_repos: number };
  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=30&sort=pushed`,
    { headers },
  );
  if (!reposRes.ok) throw new Error("GitHub: falha ao listar repositórios");

  const repos = (await reposRes.json()) as Repo[];
  const langCount = new Map<string, number>();
  let activity = 0;
  const now = Date.now();
  for (const r of repos) {
    if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
    const pushed = new Date(r.pushed_at).getTime();
    if (now - pushed < 180 * 24 * 60 * 60 * 1000) activity += 1;
  }
  const topLanguages = [...langCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const portfolioScore = Math.min(
    100,
    user.public_repos * 4 + activity * 5 + topLanguages.length * 3,
  );
  const recentActivityScore = Math.min(100, activity * 12);

  return {
    login,
    publicRepos: user.public_repos,
    topLanguages,
    recentActivityScore,
    portfolioScore,
  };
}
