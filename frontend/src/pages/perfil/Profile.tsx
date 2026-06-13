import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  GitBranch,
  Save,
  Trash2,
  Upload,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/interface/button";
import { Input } from "@/components/interface/input";
import { Label } from "@/components/interface/label";
import { Textarea } from "@/components/interface/textarea";
import { Avatar, AvatarFallback } from "@/components/interface/avatar";
import { Badge } from "@/components/interface/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/interface/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/interface/tabs";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { initials } from "@/lib/utils";

interface Profile {
  id: string;
  nome: string;
  email: string;
  role: string;
  github: string | null;
  bio: string | null;
  aceitouLGPD: boolean;
  createdAt: string;
  resumes: { id: string; nomeArquivo: string; createdAt: string }[];
  githubAnalysis: {
    score: number;
    repositorios: number;
    estrelas: number;
    seguidores: number;
    tecnologias: string[];
  } | null;
}

export function ProfilePage() {
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<Profile>({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");

  useEffect(() => {
    if (data) {
      setNome(data.nome);
      setBio(data.bio ?? "");
      setGithub(data.github ?? "");
    }
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () =>
      (await api.put("/users/me", { nome, bio, github })).data,
    onSuccess: (r) => {
      toast.success("Perfil atualizado");
      qc.invalidateQueries({ queryKey: ["me"] });
      if (user) setUser({ ...user, nome: r.nome, github: r.github });
    },
  });

  const subirCurriculo = useMutation({
    mutationFn: async (f: File) => {
      const fd = new FormData();
      fd.append("curriculo", f);
      return (
        await api.post("/resumes", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
    },
    onSuccess: () => {
      toast.success("Currículo enviado e processado!");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error ?? "Erro ao enviar"),
  });

  const analisarGithub = useMutation({
    mutationFn: async () =>
      (await api.post("/github/analisar", { github })).data,
    onSuccess: () => {
      toast.success("Análise do GitHub atualizada!");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error ?? "Erro ao analisar"),
  });

  async function baixarDados() {
    const resp = await api.get("/users/me/export", { responseType: "blob" });
    const url = URL.createObjectURL(resp.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-dados-3aq-talent.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download concluído");
  }

  async function excluirConta() {
    if (
      !confirm(
        "Tem certeza? Esta ação é permanente e apagará todos os seus dados."
      )
    )
      return;
    await api.delete("/users/me");
    toast.success("Conta excluída");
    logout();
    navigate("/");
  }

  if (isLoading || !data) {
    return <div className="h-96 shimmer rounded-2xl border border-border/40" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="pt-8 flex items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {initials(data.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                {data.nome}
              </h1>
              <p className="text-muted-foreground">{data.email}</p>
              <Badge className="mt-2">{data.role}</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          {data.role === "CANDIDATO" && (
            <>
              <TabsTrigger value="curriculo">Currículo</TabsTrigger>
              <TabsTrigger value="github">GitHub</TabsTrigger>
            </>
          )}
          <TabsTrigger value="lgpd">LGPD</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Informações pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
              {data.role === "CANDIDATO" && (
                <div className="space-y-1.5">
                  <Label>Usuário do GitHub</Label>
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="ex.: octocat"
                  />
                </div>
              )}
              <Button
                variant="gradient"
                onClick={() => salvar.mutate()}
                disabled={salvar.isPending}
              >
                <Save className="h-4 w-4" /> Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {data.role === "CANDIDATO" && (
          <TabsContent value="curriculo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Currículo (PDF)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Envie seu currículo em PDF. A IA vai ler e usar para calcular
                  sua aderência às vagas. Limite: 5 MB.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subirCurriculo.mutate(f);
                  }}
                />
                <Button
                  variant="gradient"
                  onClick={() => fileRef.current?.click()}
                  disabled={subirCurriculo.isPending}
                >
                  <Upload className="h-4 w-4" />
                  {subirCurriculo.isPending ? "Enviando..." : "Enviar PDF"}
                </Button>

                {data.resumes.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border/40">
                    <p className="text-sm font-semibold">Histórico</p>
                    {data.resumes.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-xl border border-border/50 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{r.nomeArquivo}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {data.role === "CANDIDATO" && (
          <TabsContent value="github">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" /> Análise do GitHub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.githubAnalysis ? (
                  <div className="grid sm:grid-cols-4 gap-3">
                    {[
                      { l: "Score", v: data.githubAnalysis.score },
                      { l: "Repositórios", v: data.githubAnalysis.repositorios },
                      { l: "Estrelas", v: data.githubAnalysis.estrelas },
                      { l: "Seguidores", v: data.githubAnalysis.seguidores },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="rounded-xl border border-border/50 p-4"
                      >
                        <p className="text-xs text-muted-foreground">{s.l}</p>
                        <p className="text-2xl font-extrabold">{s.v}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Você ainda não tem análise do GitHub. Clique no botão para
                    gerar.
                  </p>
                )}
                {data.githubAnalysis && (
                  <div className="flex flex-wrap gap-1">
                    {data.githubAnalysis.tecnologias.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  variant="gradient"
                  onClick={() => analisarGithub.mutate()}
                  disabled={analisarGithub.isPending || !github}
                >
                  <GitBranch className="h-4 w-4" />
                  {analisarGithub.isPending
                    ? "Analisando..."
                    : data.githubAnalysis
                      ? "Atualizar análise"
                      : "Analisar agora"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="lgpd">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Seus direitos (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A 3aq Talent respeita 100% a LGPD. Você pode baixar todos os
                seus dados quando quiser, ou apagar a conta de forma permanente.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Button variant="outline" onClick={baixarDados}>
                  <Download className="h-4 w-4" /> Baixar meus dados (JSON)
                </Button>
                <Button variant="destructive" onClick={excluirConta}>
                  <Trash2 className="h-4 w-4" /> Excluir minha conta
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Conta criada em {new Date(data.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
