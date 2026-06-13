import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Mail, KeyRound, User2, GitBranch } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/interface/button";
import { Input } from "@/components/interface/input";
import { Label } from "@/components/interface/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/interface/card";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/AlternarTema";
import { BackgroundDeco } from "@/components/DecoracaoFundo";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  nome: z.string().min(2, "Diga seu nome completo"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
  role: z.enum(["CANDIDATO", "RECRUTADOR"]),
  github: z.string().optional(),
  aceitouLGPD: z.boolean(),
}).refine((d) => d.aceitouLGPD === true, {
  path: ["aceitouLGPD"],
  message: "Você precisa aceitar os termos da LGPD",
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "CANDIDATO", aceitouLGPD: false },
  });

  const role = watch("role");
  const aceitou = watch("aceitouLGPD");

  async function onSubmit(data: FormData) {
    try {
      const { data: r } = await api.post("/auth/register", data);
      setSession(r);
      toast.success("Conta criada! Bora começar.");
      navigate("/app");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error ?? "Erro ao criar conta");
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-12">
      <BackgroundDeco />
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl shadow-primary/10">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Criar minha conta</CardTitle>
            <CardDescription>
              Em 1 minuto você está dentro da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue("role", "CANDIDATO")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    role === "CANDIDATO"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-bold">Sou Candidato</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quero me inscrever em vagas
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "RECRUTADOR")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    role === "RECRUTADOR"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-bold">Sou Recrutador</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quero criar e gerenciar vagas
                  </p>
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo</Label>
                <div className="relative">
                  <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="nome" placeholder="Seu nome" className="pl-9" {...register("nome")} />
                </div>
                {errors.nome && (
                  <p className="text-xs text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@email.com"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Pelo menos 6 caracteres"
                    className="pl-9"
                    {...register("senha")}
                  />
                </div>
                {errors.senha && (
                  <p className="text-xs text-destructive">{errors.senha.message}</p>
                )}
              </div>

              {role === "CANDIDATO" && (
                <div className="space-y-1.5">
                  <Label htmlFor="github">Usuário do GitHub (opcional)</Label>
                  <div className="relative">
                    <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="github"
                      placeholder="ex.: octocat"
                      className="pl-9"
                      {...register("github")}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    A IA vai analisar seus repositórios públicos.
                  </p>
                </div>
              )}

              <label className="flex items-start gap-2 rounded-lg border border-border/60 p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary"
                  {...register("aceitouLGPD")}
                />
                <span className="text-xs text-muted-foreground">
                  Eu concordo com o uso dos meus dados, conforme a{" "}
                  <strong className="text-foreground">LGPD</strong>. Posso baixar
                  ou apagar minha conta a qualquer momento.
                </span>
              </label>
              {errors.aceitouLGPD && (
                <p className="text-xs text-destructive">
                  {errors.aceitouLGPD.message}
                </p>
              )}

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                disabled={isSubmitting || !aceitou}
                className="w-full"
              >
                {isSubmitting ? "Criando..." : "Criar conta"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
