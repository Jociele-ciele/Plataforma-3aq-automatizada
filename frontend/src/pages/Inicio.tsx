import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Code2,
  Github,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/interface/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/AlternarTema";
import { BackgroundDeco } from "@/components/DecoracaoFundo";

const recursos = [
  {
    icon: Brain,
    titulo: "IA que lê currículos",
    desc: "O sistema analisa o currículo automaticamente e diz se o candidato combina com a vaga.",
  },
  {
    icon: Code2,
    titulo: "Correção em tempo real",
    desc: "Códigos JavaScript rodam num ambiente seguro e ganham nota na hora.",
  },
  {
    icon: Github,
    titulo: "Análise do GitHub",
    desc: "Olhamos repositórios, linguagens e atividade para entender o nível técnico.",
  },
  {
    icon: Trophy,
    titulo: "Ranking automático",
    desc: "Os melhores candidatos sobem na lista sozinhos, sem trabalho manual.",
  },
  {
    icon: ShieldCheck,
    titulo: "100% LGPD",
    desc: "Dados criptografados, exclusão total da conta e logs de auditoria.",
  },
  {
    icon: Zap,
    titulo: "Tudo em um lugar",
    desc: "Cadastro, testes, currículos e candidaturas no mesmo site.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen relative">
      <BackgroundDeco />

      <header className="container flex items-center justify-between h-16">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm" variant="gradient">
            <Link to="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </header>

      <section className="container pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Recrutamento técnico com IA
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.05]">
            Encontre os <span className="gradient-text">melhores devs</span>
            <br /> sem perder horas avaliando currículos.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A 3aq Talent automatiza tudo: lê o currículo, corrige o teste de
            código sozinho, olha o GitHub e te entrega o ranking dos melhores.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button asChild variant="gradient" size="lg">
              <Link to="/cadastro">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </div>
        </motion.div>

        {/* mockup decorativo do dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-20 mx-auto max-w-5xl"
        >
          <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-2xl shadow-primary/10 p-2">
            <div className="rounded-xl bg-background/80 p-6 grid md:grid-cols-3 gap-4 text-left">
              {[
                { label: "Vagas abertas", v: "12", g: "from-primary to-fuchsia-500" },
                { label: "Candidatos analisados", v: "248", g: "from-fuchsia-500 to-accent" },
                { label: "Tempo médio de triagem", v: "1m 12s", g: "from-accent to-emerald-400" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/50 p-5 bg-card/60"
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p
                    className={`mt-2 text-3xl font-extrabold bg-gradient-to-r ${item.g} bg-clip-text text-transparent`}
                  >
                    {item.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tudo que o seu RH precisava
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pensado para tirar o trabalho repetitivo do dia a dia e deixar a
            equipe focada no que importa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {recursos.map((r, i) => (
            <motion.div
              key={r.titulo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-hover rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">{r.titulo}</h3>
              <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-fuchsia-500 to-accent p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-10" />
          <h2 className="text-3xl md:text-4xl font-extrabold relative">
            Pronto para contratar mais rápido?
          </h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto relative">
            Crie uma conta gratuita e veja o sistema funcionando em menos de 2
            minutos.
          </p>
          <div className="mt-8 flex justify-center relative">
            <Button asChild size="lg" variant="secondary">
              <Link to="/cadastro">
                Criar minha conta <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="container py-10 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} 3aq Tecnologia LTDA. Projeto Aplicado IV
          — SENAI SC.
        </p>
      </footer>
    </div>
  );
}
