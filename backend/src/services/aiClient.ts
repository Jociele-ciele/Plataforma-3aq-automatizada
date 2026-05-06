import { config } from "../config.js";

export type CvAnalysisResult = {
  technical_score: number;
  fit_score: number;
  summary: string;
  matched_keywords: string[];
};

export async function analyzeCvText(text: string, jobKeywords: string[]): Promise<CvAnalysisResult> {
  const url = `${config.aiServiceUrl.replace(/\/$/, "")}/analyze-cv`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, job_keywords: jobKeywords }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Serviço de IA indisponível: ${res.status} ${err}`);
  }
  return (await res.json()) as CvAnalysisResult;
}

