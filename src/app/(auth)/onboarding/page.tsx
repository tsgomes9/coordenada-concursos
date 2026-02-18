"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
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
  Star,
  Users,
  ArrowRight,
  Rocket,
  Brain,
  Coffee,
  Smartphone,
  Laptop,
  Trophy,
  Flame,
  Medal,
  Crown,
} from "lucide-react";

// Lista de concursos (depois virá do Firestore)
const concursosData = [
  {
    id: "pf",
    nome: "Polícia Federal",
    area: "Segurança Pública",
    cor: "from-orange-500 to-orange-600",
    icone: "🛡️",
    vagas: 500,
    inscritos: "15k",
    corFundo: "bg-orange-50",
    trending: true,
  },
  {
    id: "prf",
    nome: "PRF",
    area: "Segurança Pública",
    cor: "from-orange-400 to-orange-500",
    icone: "🚓",
    vagas: 1000,
    inscritos: "25k",
    corFundo: "bg-orange-50/70",
    trending: true,
  },
  {
    id: "inss",
    nome: "INSS",
    area: "Previdência",
    cor: "from-orange-500 to-orange-600",
    icone: "🏥",
    vagas: 2000,
    inscritos: "50k",
    corFundo: "bg-orange-50",
  },
  {
    id: "bb",
    nome: "Banco do Brasil",
    area: "Bancário",
    cor: "from-orange-400 to-orange-500",
    icone: "🏦",
    vagas: 4000,
    inscritos: "80k",
    corFundo: "bg-orange-50/70",
  },
  {
    id: "trf1",
    nome: "TRF 1ª Região",
    area: "Judiciário",
    cor: "from-orange-500 to-orange-600",
    icone: "⚖️",
    vagas: 300,
    inscritos: "10k",
    corFundo: "bg-orange-50",
  },
  {
    id: "sefa",
    nome: "SEFAZ SP",
    area: "Fiscal",
    cor: "from-orange-400 to-orange-500",
    icone: "📊",
    vagas: 150,
    inscritos: "25k",
    corFundo: "bg-orange-50/70",
  },
  {
    id: "camara",
    nome: "Câmara dos Deputados",
    area: "Legislativo",
    cor: "from-orange-500 to-orange-600",
    icone: "🏛️",
    vagas: 400,
    inscritos: "30k",
    corFundo: "bg-orange-50",
  },
  {
    id: "tcu",
    nome: "TCU",
    area: "Controle",
    cor: "from-orange-400 to-orange-500",
    icone: "📋",
    vagas: 200,
    inscritos: "20k",
    corFundo: "bg-orange-50/70",
  },
  {
    id: "abim",
    nome: "ABIM",
    area: "Inteligência",
    cor: "from-orange-500 to-orange-600",
    icone: "🔍",
    vagas: 100,
    inscritos: "8k",
    corFundo: "bg-orange-50",
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
  const [selectedConcursos, setSelectedConcursos] = useState<string[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<number | null>(null);
  const [selectedEstilos, setSelectedEstilos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar concursos
  const filteredConcursos = concursosData.filter(
    (concurso) =>
      concurso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concurso.area.toLowerCase().includes(searchTerm.toLowerCase()),
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
    if (step === 1 && selectedConcursos.length === 0) {
      alert("Selecione pelo menos um concurso");
      return;
    }
    if (step === 2 && !selectedMeta) {
      alert("Selecione sua meta diária");
      return;
    }
    if (step === 3 && selectedEstilos.length === 0) {
      alert("Selecione pelo menos um estilo de aprendizado");
      return;
    }
    if (step === 4) {
      handleComplete();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // Voltar passo
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Finalizar onboarding
  const handleComplete = async () => {
    setIsLoading(true);
    // TODO: Salvar preferências no Firestore
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/dashboard");
  };

  // Pular onboarding
  const handleSkip = () => {
    router.push("/dashboard");
  };

  // Progresso do onboarding
  const progress = (step / 4) * 100;

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
            Passo {step} de 4
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
          {/* STEP 1: Escolher Concursos */}
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
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 1 de 4</span>
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
                <input
                  type="text"
                  placeholder="Buscar concurso ou área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Grid de concursos */}
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
                    {concurso.trending && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Trending</span>
                        </div>
                      </div>
                    )}
                    <div className="text-2xl mb-2">{concurso.icone}</div>
                    <h3 className="font-display font-bold text-gray-900 text-sm mb-1">
                      {concurso.nome}
                    </h3>
                    <p className="text-xs text-gray-500">{concurso.area}</p>
                    {selectedConcursos.includes(concurso.id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">
                    {selectedConcursos.length}{" "}
                    {selectedConcursos.length === 1 ? "concurso" : "concursos"}{" "}
                    selecionados
                  </span>
                </div>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Meta Diária */}
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
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 2 de 4</span>
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
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Estilos de Aprendizado */}
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
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 3 de 4</span>
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
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
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
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Resumo e Confirmação */}
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
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Passo 4 de 4</span>
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
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold">Seus concursos</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedConcursos.map((id) => {
                      const concurso = concursosData.find((c) => c.id === id);
                      return (
                        concurso && (
                          <span
                            key={id}
                            className="bg-white/20 px-3 py-1 rounded-full text-sm"
                          >
                            {concurso.icone} {concurso.nome}
                          </span>
                        )
                      );
                    })}
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

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Medal className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Sua conquista inicial
                      </p>
                      <p className="font-medium text-gray-900">
                        Explorador de concursos
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
                <Button
                  onClick={handleComplete}
                  isLoading={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8"
                >
                  {isLoading ? "Preparando tudo..." : "Começar a estudar"}
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
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
