import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, Mail, KeyRound } from "lucide-react";
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
  email: z.string().email("Coloque um e-mail válido"),
  senha: z.string().min(1, "Informe sua senha"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const { data: r } = await api.post("/auth/login", data);
      setSession(r);
      toast.success(`Bem-vindo de volta, ${r.user.nome.split(" ")[0]}!`);
      navigate("/app");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error ?? "Não foi possível entrar");
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
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
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl shadow-primary/10">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Coloque seu e-mail e sua senha para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                    placeholder="********"
                    className="pl-9"
                    {...register("senha")}
                  />
                </div>
                {errors.senha && (
                  <p className="text-xs text-destructive">{errors.senha.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Entrando..." : "Entrar"} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Ainda não tem conta?{" "}
              <Link to="/cadastro" className="text-primary font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>

            <div className="mt-6 p-3 rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold">Contas de teste:</p>
              <p>
                Recrutador: <code>recrutador@3aq.com</code> / <code>123456</code>
              </p>
              <p>
                Candidato: <code>candidato@3aq.com</code> / <code>123456</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
