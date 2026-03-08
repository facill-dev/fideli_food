import { motion } from "framer-motion";
import { ArrowRight, Store, Zap, Palette, BarChart3, Smartphone, Globe, Sparkles } from "lucide-react";
import { NicheIcon } from "@/components/NicheIcon";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getAllStores } from "@/lib/multiTenantStorage";
import { useAuth } from "@/contexts/AuthContext";
import { NICHES } from "@/lib/multiTenantStorage";

const features = [
  { icon: Store, title: "Sua loja em minutos", desc: "Crie seu cardápio digital completo sem precisar de desenvolvedor." },
  { icon: Palette, title: "Personalizável", desc: "Escolha cores, logo, nicho e configure tudo do seu jeito." },
  { icon: Smartphone, title: "Mobile first", desc: "Experiência otimizada para celular, como o iFood." },
  { icon: BarChart3, title: "Painel admin", desc: "Gerencie produtos, pedidos e clientes em um só lugar." },
  { icon: Globe, title: "Link compartilhável", desc: "Seu cardápio tem uma URL única para enviar aos clientes." },
  { icon: Zap, title: "Rápido e leve", desc: "Carregamento instantâneo para não perder nenhuma venda." },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user, store } = useAuth();
  const stores = getAllStores();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-xl text-foreground">
            Cardápio<span className="text-primary">Digital</span>
          </span>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {store ? (
                  <Button size="sm" onClick={() => navigate("/admin")}>
                    Meu painel
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => navigate("/onboarding")}>
                    Criar minha loja
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Entrar
                </Button>
                <Button size="sm" onClick={() => navigate("/cadastro")}>
                  Criar conta grátis
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 inline" /> Grátis para começar
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
              Crie seu cardápio digital em{" "}
              <span className="text-primary">minutos</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Monte sua loja online com cardápio, pedidos e painel de gestão.
              Compartilhe o link e comece a vender hoje mesmo.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-base gap-2"
                onClick={() => navigate(user ? "/onboarding" : "/cadastro")}
              >
                Criar minha loja grátis
                <ArrowRight className="h-4 w-4" />
              </Button>
              {stores.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base"
                  onClick={() => {
                    document.getElementById("lojas")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ver lojas criadas
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Nichos */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-center mb-8">
            Para todo tipo de negócio
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {NICHES.map((n) => (
              <motion.div
                key={n.id}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-sm"
              >
                <NicheIcon name={n.icon} className="h-5 w-5" />
                <span className="text-sm font-medium text-foreground">{n.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
            Tudo que você precisa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stores showcase */}
      {stores.length > 0 && (
        <section id="lojas" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              Lojas criadas na plataforma
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((s) => {
                const niche = NICHES.find((n) => n.id === s.niche);
                return (
                  <motion.a
                    key={s.id}
                    href={`/loja/${s.slug}`}
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {s.logo ? (
                        <img src={s.logo} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: s.primaryColor || "hsl(var(--primary))" }}
                        >
                          <NicheIcon name={niche?.icon} className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-display font-bold text-foreground text-sm">{s.name}</h3>
                        <span className="text-xs text-muted-foreground">{niche?.label || s.niche}</span>
                      </div>
                    </div>
                    {s.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                    )}
                  </motion.a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Crie sua loja em menos de 5 minutos. Sem cartão de crédito.
          </p>
          <Button size="lg" className="gap-2" onClick={() => navigate(user ? "/onboarding" : "/cadastro")}>
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CardápioDigital. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
