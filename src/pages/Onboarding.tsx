import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { createStore, NICHES } from "@/lib/multiTenantStorage";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const STEPS = ["Nicho", "Info", "Detalhes"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  const [niche, setNiche] = useState("");
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [instagram, setInstagram] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#d64d7a");

  if (!user) {
    navigate("/login");
    return null;
  }

  if (user.storeId) {
    navigate("/admin");
    return null;
  }

  const canNext = () => {
    if (step === 0) return !!niche;
    if (step === 1) return storeName.trim().length >= 2;
    return true;
  };

  const handleCreate = () => {
    try {
      createStore(user.id, {
        name: storeName,
        slug: "",
        niche,
        description,
        logo: "",
        primaryColor,
        address,
        city,
        phone,
        hours,
        instagram,
      });
      refreshUser();
      toast({ title: "Loja criada com sucesso! 🎉" });
      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Configure sua loja
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Passo {step + 1} de {STEPS.length}: {STEPS[step]}
          </p>
          {/* Progress bar */}
          <div className="flex gap-2 mt-4 max-w-xs mx-auto">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="font-display font-bold text-foreground">Qual é o seu nicho?</h2>
                <p className="text-sm text-muted-foreground">Selecione o tipo do seu negócio</p>
                <div className="grid grid-cols-2 gap-3">
                  {NICHES.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setNiche(n.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        niche === n.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="text-2xl">{n.icon}</span>
                      <span className="text-sm font-medium text-foreground">{n.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="font-display font-bold text-foreground">Informações da loja</h2>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Nome da loja *</Label>
                    <Input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ex: Festival de Fatias"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Uma breve descrição do seu negócio..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor principal</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">{primaryColor}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="font-display font-bold text-foreground">Detalhes (opcional)</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Santarém" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(93) 99999-0000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Horário</Label>
                      <Input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Ter a Sáb · 9h-18h" />
                    </div>
                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@sualoja" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {step > 0 ? "Voltar" : "Sair"}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gap-1">
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={!canNext()} className="gap-1">
                <Check className="h-4 w-4" />
                Criar loja
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
