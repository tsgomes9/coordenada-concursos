"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  BookOpen,
  Clock,
  Users,
  Award,
  TrendingUp,
  Star,
  Play,
  Headphones,
  Zap,
  CheckCircle,
  Lock,
  Sparkles,
  GraduationCap,
  FileText,
  BarChart,
} from "lucide-react";

// Dados mockados (depois virão do JSON)
const concursoData = {
  id: "pf",
  nome: "Polícia Federal",
  banca: "Cebraspe",
  nivel: "Superior",
  thumbnail: "🛡️",
  cor: "from-orange-500 to-orange-600",
  descricao:
    "Carreira de alto prestígio com salários iniciais acima de R$ 12.000",
  stats: {
    vagas: 500,
    inscritos: "15k",
    materias: 12,
    topicos: 156,
    questoes: 1200,
    rating: 4.9,
  },
  ultimoEdital: "2024",
  materias: [
    {
      id: "portugues", // ← ESSE ID é usado na URL
      nome: "Português",
      icone: "📝",
      progresso: 75,
      topicos: [
        {
          id: "crases", // ← ESSE ID é usado na URL
          titulo: "Uso da Crase",
          tempoEstimado: 45,
          isPreview: true,
        },
        {
          id: "concordancia",
          titulo: "Concordância Verbal",
          tempoEstimado: 50,
          isPreview: false,
        },
        {
          id: "pontuacao",
          titulo: "Pontuação",
          tempoEstimado: 40,
          isPreview: false,
        },
      ],
    },
    {
      id: "direito-constitucional",
      nome: "Direito Constitucional",
      icone: "⚖️",
      progresso: 45,
      topicos: [
        {
          id: "art1-4",
          titulo: "Art. 1º ao 4º - Fundamentos",
          tempoEstimado: 60,
          isPreview: true,
        },
      ],
    },
  ],
};

export default function ConcursoDetalhePage() {
  const params = useParams();
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [materiaExpandida, setMateriaExpandida] = useState<string | null>(null);

  // Calcular progresso total
  const progressoTotal = Math.round(
    concursoData.materias.reduce((acc, m) => acc + m.progresso, 0) /
      concursoData.materias.length,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-orange-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/concursos"
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition mr-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="font-display text-xl font-bold text-gray-900">
              {concursoData.nome}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div
            className={`bg-gradient-to-r ${concursoData.cor} rounded-3xl p-8 text-white relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{concursoData.thumbnail}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-3xl font-bold">
                      {concursoData.nome}
                    </h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {concursoData.banca}
                    </span>
                  </div>
                  <p className="text-orange-100">{concursoData.descricao}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {concursoData.stats.materias}
                  </div>
                  <div className="text-sm text-orange-100">Matérias</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {concursoData.stats.topicos}
                  </div>
                  <div className="text-sm text-orange-100">Tópicos</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {concursoData.stats.questoes}
                  </div>
                  <div className="text-sm text-orange-100">Questões</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {concursoData.stats.vagas}
                  </div>
                  <div className="text-sm text-orange-100">Vagas</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progresso Geral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-bold text-gray-900">
                Seu Progresso Geral
              </h3>
            </div>
            <span className="text-2xl font-bold text-orange-500">
              {progressoTotal}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressoTotal}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full bg-gradient-to-r ${concursoData.cor}`}
            />
          </div>
        </motion.div>

        {/* LISTA DE MATÉRIAS E TÓPICOS */}
        <div className="space-y-4">
          {concursoData.materias.map((materia) => (
            <motion.div
              key={materia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Cabeçalho da Matéria - clicável para expandir */}
              <button
                onClick={() =>
                  setMateriaExpandida(
                    materiaExpandida === materia.id ? null : materia.id,
                  )
                }
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{materia.icone}</span>
                  <div className="text-left">
                    <h3 className="font-display font-bold text-gray-900">
                      {materia.nome}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {materia.topicos.length} tópicos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-display font-bold text-orange-500">
                      {materia.progresso}%
                    </div>
                    <div className="text-xs text-gray-400">concluído</div>
                  </div>
                  <ChevronLeft
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      materiaExpandida === materia.id
                        ? "rotate-90"
                        : "-rotate-90"
                    }`}
                  />
                </div>
              </button>

              {/* 🔥 AQUI É ONDE COLOCAMOS OS LINKS DOS TÓPICOS! 🔥 */}
              {materiaExpandida === materia.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100"
                >
                  {materia.topicos.map((topico, index) => (
                    <Link
                      key={topico.id}
                      href={`/materia/${materia.id}/topico/${topico.id}`}
                      className="block"
                    >
                      <div
                        className={`p-4 hover:bg-orange-50 transition flex items-center justify-between ${
                          index !== materia.topicos.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {topico.isPreview ? (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                              FREE
                            </span>
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {topico.titulo}
                            </p>
                            <p className="text-xs text-gray-500">
                              {topico.tempoEstimado} min
                            </p>
                          </div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
