"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Logo } from "@/components/LogoCoordenada";
import { Button } from "@/components/ui/Button";
import {
  Target,
  Clock,
  Award,
  ChevronRight,
  Check,
  Sparkles,
  GraduationCap,
  BookOpen,
  Headphones,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  Rocket,
  Brain,
  Coffee,
  Flame,
  Medal,
  Loader2,
  Search,
  Heart,
  Briefcase,
  Shield,
  Scale,
  Calculator,
  FileText,
  Gavel,
  Building,
  Stethoscope,
  Cpu,
  BarChart,
  Landmark,
  Users2,
  TreePine,
  Globe,
  Plus,
} from "lucide-react";

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  thumbnail?: string;
  vagas: number;
  area?: string;
}

// Áreas de atuação disponíveis
const areasDisponiveis = [
  {
    id: "tecnologia",
    nome: "Tecnologia",
    icone: <Cpu className="w-5 h-5" />,
    cor: "bg-blue-100 text-blue-600",
  },
  {
    id: "saude",
    nome: "Saúde",
    icone: <Stethoscope className="w-5 h-5" />,
    cor: "bg-green-100 text-green-600",
  },
  {
    id: "psicologia",
    nome: "Psicologia",
    icone: <Brain className="w-5 h-5" />,
    cor: "bg-purple-100 text-purple-600",
  },
  {
    id: "direito",
    nome: "Direito",
    icone: <Gavel className="w-5 h-5" />,
    cor: "bg-red-100 text-red-600",
  },
  {
    id: "administracao",
    nome: "Administração",
    icone: <Briefcase className="w-5 h-5" />,
    cor: "bg-orange-100 text-orange-600",
  },
  {
    id: "contabilidade",
    nome: "Contabilidade",
    icone: <Calculator className="w-5 h-5" />,
    cor: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "educacao",
    nome: "Educação",
    icone: <BookOpen className="w-5 h-5" />,
    cor: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "engenharia",
    nome: "Engenharia",
    icone: <Building className="w-5 h-5" />,
    cor: "bg-cyan-100 text-cyan-600",
  },
  {
    id: "seguranca",
    nome: "Segurança Pública",
    icone: <Shield className="w-5 h-5" />,
    cor: "bg-slate-100 text-slate-600",
  },
  {
    id: "fiscal",
    nome: "Fiscal",
    icone: <BarChart className="w-5 h-5" />,
    cor: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "bancario",
    nome: "Bancário",
    icone: <Landmark className="w-5 h-5" />,
    cor: "bg-teal-100 text-teal-600",
  },
  {
    id: "judiciario",
    nome: "Judiciário",
    icone: <Scale className="w-5 h-5" />,
    cor: "bg-rose-100 text-rose-600",
  },
  {
    id: "legislativo",
    nome: "Legislativo",
    icone: <FileText className="w-5 h-5" />,
    cor: "bg-amber-100 text-amber-600",
  },
  {
    id: "meio-ambiente",
    nome: "Meio Ambiente",
    icone: <TreePine className="w-5 h-5" />,
    cor: "bg-lime-100 text-lime-600",
  },
  {
    id: "relacoes-internacionais",
    nome: "Relações Internacionais",
    icone: <Globe className="w-5 h-5" />,
    cor: "bg-violet-100 text-violet-600",
  },
  {
    id: "recursos-humanos",
    nome: "Recursos Humanos",
    icone: <Users2 className="w-5 h-5" />,
    cor: "bg-fuchsia-100 text-fuchsia-600",
  },
  {
    id: "outros",
    nome: "Outros",
    icone: <Plus className="w-5 h-5" />,
    cor: "bg-gray-100 text-gray-600",
  },
];

// Metas diárias
const metasDiarias = [
  {
    valor: 30,
    label: "30 min",
    descricao: "Iniciante",
    icone: <Coffee className="w-5 h-5" />,
    cor: "bg-green-100 text-green-600",
  },
  {
    valor: 60,
    label: "1 hora",
    descricao: "Recomendado",
    icone: <Brain className="w-5 h-5" />,
    cor: "bg-blue-100 text-blue-600",
    popular: true,
  },
  {
    valor: 120,
    label: "2 horas",
    descricao: "Avançado",
    icone: <Zap className="w-5 h-5" />,
    cor: "bg-orange-100 text-orange-600",
  },
  {
    valor: 180,
    label: "3 horas",
    descricao: "Intensivo",
    icone: <Flame className="w-5 h-5" />,
    cor: "bg-red-100 text-red-600",
  },
];

// Estilos de aprendizado
const estilosAprendizado = [
  {
    id: "texto",
    label: "Leitura",
    icone: <BookOpen className="w-5 h-5" />,
    descricao: "Conteúdo em texto",
  },
  {
    id: "audio",
    label: "Áudio",
    icone: <Headphones className="w-5 h-5" />,
    descricao: "Podcasts e aulas",
  },
  {
    id: "questoes",
    label: "Questões",
    icone: <Zap className="w-5 h-5" />,
    descricao: "Prática intensiva",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icone: <Brain className="w-5 h-5" />,
    descricao: "Memorização",
  },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dados do Firebase
  const [concursos, setConcursos] = useState<Concurso[]>([]);

  // Seleções do usuário
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedConcursos, setSelectedConcursos] = useState<string[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<number | null>(null);
  const [selectedEstilos, setSelectedEstilos] = useState<string[]>([]);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllAreas, setShowAllAreas] = useState(false);

  // Carregar concursos do Firebase
  useEffect(() => {
    async function carregarConcursos() {
      try {
        const snapshot = await getDocs(collection(db, "concursos"));
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome || "Concurso",
          banca: doc.data().banca || "",
          thumbnail: doc.data().thumbnail || "📚",
          vagas: doc.data().vagas || 0,
          area: doc.data().areas?.[0] || "Geral",
        })) as Concurso[];

        setConcursos(lista);
      } catch (error) {
        console.error("Erro ao carregar concursos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarConcursos();
  }, []);

  // Áreas para exibir (mostrar 8 ou todas)
  const areasParaExibir = showAllAreas
    ? areasDisponiveis
    : areasDisponiveis.slice(0, 8);

  // Toggle área
  const toggleArea = (id: string) => {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Filtrar concursos
  const filteredConcursos = concursos.filter(
    (concurso) =>
      concurso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.banca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.area?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Toggle concurso
  const toggleConcurso = (id: string) => {
    setSelectedConcursos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Toggle estilo
  const toggleEstilo = (id: string) => {
    setSelectedEstilos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Avançar passo
  const handleNext = () => {
    if (step === 1 && selectedAreas.length === 0) {
      alert("Selecione pelo menos uma área de interesse");
      return;
    }
    if (step === 2 && selectedConcursos.length === 0) {
      alert("Selecione pelo menos um concurso");
      return;
    }
    if (step === 3 && !selectedMeta) {
      alert("Selecione sua meta diária");
      return;
    }
    if (step === 4 && selectedEstilos.length === 0) {
      alert("Selecione pelo menos um estilo de aprendizado");
      return;
    }
    if (step === 5) {
      handleComplete();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // Voltar passo
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Finalizar onboarding - SALVAR NO FIREBASE
  const handleComplete = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const userRef = doc(db, "usuarios", user.uid);

      await updateDoc(userRef, {
        "preferences.areasInteresse": selectedAreas,
        "preferences.concursosInteresse": selectedConcursos,
        "preferences.metaDiaria": selectedMeta || 60,
        "preferences.estilosAprendizado": selectedEstilos,
        "preferences.onboardingCompleto": true,
        updatedAt: new Date(),
      });

      // Pequeno delay para feedback visual
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      alert("Erro ao salvar preferências. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Pular onboarding
  const handleSkip = () => {
    router.push("/dashboard");
  };

  // Progresso do onboarding
  const progress = (step / 5) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      {/* Bolhas decorativas */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-orange-100/50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-orange-600 transition font-medium"
            >
              Pular por enquanto
            </button>
          </div>
        </div>
      </header>

      {/* Barra de progresso */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-orange-600">
            Passo {step} de 5
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% concluído
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Áreas de Interesse */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-4">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 1 de 5</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  Quais áreas te interessam?
                </h1>
                <p className="text-gray-600">
                  Selecione as áreas que você quer acompanhar. Vamos sugerir
                  concursos baseado nisso.
                </p>
              </div>

              {/* Grid de Áreas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-h-[400px] overflow-y-auto p-2">
                {areasParaExibir.map((area) => (
                  <motion.button
                    key={area.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleArea(area.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      selectedAreas.includes(area.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200 bg-white"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 ${area.cor} rounded-lg flex items-center justify-center mb-3`}
                    >
                      {area.icone}
                    </div>
                    <h3 className="font-display font-bold text-gray-900 text-sm mb-1">
                      {area.nome}
                    </h3>
                    {selectedAreas.includes(area.id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Botão Ver Mais */}
              {areasDisponiveis.length > 8 && (
                <button
                  onClick={() => setShowAllAreas(!showAllAreas)}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium mb-6"
                >
                  {showAllAreas
                    ? "Mostrar menos"
                    : `Ver mais ${areasDisponiveis.length - 8} áreas`}
                </button>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">
                    {selectedAreas.length}{" "}
                    {selectedAreas.length === 1
                      ? "área selecionada"
                      : "áreas selecionadas"}
                  </span>
                </div>
                <Button
                  onClick={handleNext}
                  disabled={selectedAreas.length === 0}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Escolher Concursos */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-4">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 2 de 5</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  Quais concursos você quer estudar?
                </h1>
                <p className="text-gray-600">
                  Selecione um ou mais concursos para personalizar sua
                  experiência
                </p>
              </div>

              {/* Barra de busca */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar concurso por nome, banca ou área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                />
              </div>

              {/* Grid de concursos */}
              {concursos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1 mb-6">
                  {filteredConcursos.map((concurso) => (
                    <motion.button
                      key={concurso.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleConcurso(concurso.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        selectedConcursos.includes(concurso.id)
                          ? `border-orange-500 bg-orange-50`
                          : "border-gray-200 hover:border-orange-200 bg-white"
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {concurso.thumbnail || "📚"}
                      </div>
                      <h3 className="font-display font-bold text-gray-900 text-sm mb-1">
                        {concurso.nome}
                      </h3>
                      <p className="text-xs text-gray-500">{concurso.banca}</p>
                      {selectedConcursos.includes(concurso.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl mb-6">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum concurso disponível</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selectedConcursos.length === 0}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Meta Diária */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 3 de 5</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  Qual sua meta diária?
                </h1>
                <p className="text-gray-600">
                  Defina quanto tempo você quer estudar por dia
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {metasDiarias.map((meta) => (
                  <motion.button
                    key={meta.valor}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMeta(meta.valor)}
                    className={`relative p-6 rounded-2xl border-2 transition-all ${
                      selectedMeta === meta.valor
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200 bg-white"
                    }`}
                  >
                    {meta.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                        Mais escolhido
                      </div>
                    )}
                    <div
                      className={`w-12 h-12 ${meta.cor} rounded-xl flex items-center justify-center mx-auto mb-3`}
                    >
                      {meta.icone}
                    </div>
                    <div className="font-display text-2xl font-bold text-gray-900 mb-1">
                      {meta.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {meta.descricao}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">
                      Dica da Coordenada
                    </h3>
                    <p className="text-orange-100 text-sm">
                      Comece com 1 hora por dia e aumente gradualmente. O
                      segredo é a consistência, não a quantidade!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!selectedMeta}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Estilos de Aprendizado */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-4">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 4 de 5</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  Como você gosta de estudar?
                </h1>
                <p className="text-gray-600">
                  Selecione seus métodos preferidos de aprendizado
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {estilosAprendizado.map((estilo) => (
                  <motion.button
                    key={estilo.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleEstilo(estilo.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                      selectedEstilos.includes(estilo.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selectedEstilos.includes(estilo.id)
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {estilo.icone}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-gray-900">
                          {estilo.label}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {estilo.descricao}
                        </p>
                      </div>
                    </div>
                    {selectedEstilos.includes(estilo.id) && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-orange-500" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selectedEstilos.length === 0}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Resumo e Confirmação */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-4">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 5 de 5</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  Tudo pronto! 🚀
                </h1>
                <p className="text-gray-600">
                  Personalizamos sua experiência com base nas suas escolhas
                </p>
              </div>

              {/* Cards de resumo */}
              <div className="space-y-4 mb-8">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold">
                      Áreas de interesse
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAreas.map((id) => {
                      const area = areasDisponiveis.find((a) => a.id === id);
                      return (
                        area && (
                          <span
                            key={id}
                            className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {area.icone} {area.nome}
                          </span>
                        )
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold">Seus concursos</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedConcursos.slice(0, 3).map((id) => {
                      const concurso = concursos.find((c) => c.id === id);
                      return (
                        concurso && (
                          <span
                            key={id}
                            className="bg-white/20 px-3 py-1 rounded-full text-sm"
                          >
                            {concurso.thumbnail || "📚"} {concurso.nome}
                          </span>
                        )
                      );
                    })}
                    {selectedConcursos.length > 3 && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        +{selectedConcursos.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-700">
                        Meta diária
                      </span>
                    </div>
                    <span className="font-display text-2xl font-bold text-gray-900">
                      {selectedMeta} min
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-700">Estilos</span>
                    </div>
                    <span className="font-display text-2xl font-bold text-gray-900">
                      {selectedEstilos.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
                <Button
                  onClick={handleComplete}
                  isLoading={saving}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  {saving ? "Salvando..." : "Começar a estudar"}
                  {!saving && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer com dicas */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-8 text-center">
        <p className="text-sm text-gray-500">
          ✨ Você pode alterar essas configurações depois a qualquer momento
        </p>
      </div>
    </div>
  );
}
