"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  Loader2,
  Award,
  Clock,
  CheckCircle,
  Briefcase,
  Sparkles,
  Layers,
  Target,
  Zap,
  Coffee,
  Brain,
  Flame,
  Calendar,
  DollarSign,
  Tag,
  Activity,
} from "lucide-react";

interface Concurso {
  id: string;
  nome: string;
  banca: string;
  status: string;
  createdAt?: any;
}

// Componente de Card de Métrica Principal
function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 " />
        <span className="text-3xl font-black">{value}</span>
      </div>
      <p className=" text-sm">{label}</p>
      {subtitle && <p className="text-xs mt-2">{subtitle}</p>}
    </motion.div>
  );
}

// Componente de Card Secundário
function SecondaryCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconColor,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
  iconColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
        <div className={`p-3 ${iconColor} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    concursos: 0,
    concursosAbertos: 0,
    materias: 0,
    catalogo: 0,
    usuarios: 0,
    usuariosAtivos: 0,
    topicos: 0,
    exercicios: 0,
    flashcards: 0,
  });
  const [ultimosConcursos, setUltimosConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        console.log("🔍 Carregando estatísticas...");

        // Carregar concursos
        const concursosSnap = await getDocs(collection(db, "concursos"));
        const concursos = concursosSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Concurso[];

        const concursosAbertos = concursos.filter(
          (c) => c.status === "aberto",
        ).length;

        // Carregar matérias
        const materiasSnap = await getDocs(collection(db, "materias"));

        // Carregar catálogo
        const catalogoSnap = await getDocs(collection(db, "catalogo"));

        // Carregar usuários
        const usuariosSnap = await getDocs(collection(db, "usuarios"));
        const usuariosAtivos = usuariosSnap.docs.filter(
          (doc) =>
            doc.data().subscription?.status === "active" ||
            doc.data().subscription?.status === "trial",
        ).length;

        // Buscar últimos 5 concursos
        const concursosQuery = query(
          collection(db, "concursos"),
          orderBy("createdAt", "desc"),
          limit(5),
        );
        const ultimosSnap = await getDocs(concursosQuery);
        const ultimos = ultimosSnap.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome,
          banca: doc.data().banca,
          status: doc.data().status,
          createdAt: doc.data().createdAt,
        })) as Concurso[];

        // Calcular total de tópicos, exercícios e flashcards (estimativa baseada no catálogo)
        const totalTopicos = catalogoSnap.size * 3;
        const totalExercicios = catalogoSnap.size * 2;
        const totalFlashcards = catalogoSnap.size * 4;

        setStats({
          concursos: concursosSnap.size,
          concursosAbertos,
          materias: materiasSnap.size,
          catalogo: catalogoSnap.size,
          usuarios: usuariosSnap.size,
          usuariosAtivos,
          topicos: totalTopicos,
          exercicios: totalExercicios,
          flashcards: totalFlashcards,
        });

        setUltimosConcursos(ultimos);
      } catch (error: any) {
        console.error("❌ Erro detalhado:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
        />
        <p className="text-gray-500">Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h2 className="text-red-600 font-bold mb-2">Erro de permissão</h2>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <p className="text-gray-600 text-sm">
          Verifique se as regras do Firestore estão corretas e se você está
          logado como admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header com gradiente preto/roxo */}
      <div className="bg-gradient-to-r from-black to-purple-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Painel Administrativo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">Dashboard</h1>
          </div>
        </div>
      </div>

      {/* Stats Cards - Linha 1 (Principais) */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard
          icon={Briefcase}
          label="Concursos"
          value={stats.concursos}
          subtitle={`${stats.concursosAbertos} abertos`}
          color="from-green-700 to-green-900"
          delay={0.1}
        />
        <MetricCard
          icon={FileText}
          label="Matérias"
          value={stats.materias}
          color="from-orange-700 to-orange-900"
          delay={0.2}
        />
        <MetricCard
          icon={BookOpen}
          label="Conteúdos"
          value={stats.catalogo}
          color="from-blue-700 to-purple-900"
          delay={0.3}
        />
        <MetricCard
          icon={Users}
          label="Usuários"
          value={stats.usuarios}
          subtitle={`${stats.usuariosAtivos} ativos`}
          color="from-pink-800 to-orange-900"
          delay={0.4}
        />
      </div>

      {/* Stats Cards - Linha 2 (Conteúdo) */}
      <div className="grid md:grid-cols-3 gap-6">
        <SecondaryCard
          icon={Layers}
          label="Tópicos"
          value={stats.topicos}
          subtitle="em todo o catálogo"
          iconColor="bg-orange-500"
          delay={0.5}
        />
        <SecondaryCard
          icon={CheckCircle}
          label="Exercícios"
          value={stats.exercicios}
          subtitle="questões disponíveis"
          iconColor="bg-green-500"
          delay={0.6}
        />
        <SecondaryCard
          icon={Award}
          label="Flashcards"
          value={stats.flashcards}
          subtitle="para revisão"
          iconColor="bg-purple-500"
          delay={0.7}
        />
      </div>

      {/* Grid Principal */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ações rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
        >
          <h2 className="font-display font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Ações rápidas
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/concursos/novo"
              className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg transition group"
            >
              <span className="text-gray-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition" />
                Criar novo concurso
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/admin/materias"
              className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg transition group"
            >
              <span className="text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition" />
                Gerenciar matérias
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/admin/catalogo/novo"
              className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg transition group"
            >
              <span className="text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition" />
                Criar novo conteúdo
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/admin/usuarios"
              className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg transition group"
            >
              <span className="text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition" />
                Gerenciar usuários
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </motion.div>

        {/* Últimos concursos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
        >
          <h2 className="font-display font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Últimos concursos
          </h2>

          {ultimosConcursos.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Nenhum concurso cadastrado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {ultimosConcursos.map((concurso, index) => (
                <motion.div
                  key={concurso.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <Link
                    href={`/admin/concursos/${concurso.id}/editar`}
                    className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg transition group"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {concurso.nome}
                      </p>
                      <p className="text-sm text-gray-500">{concurso.banca}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          concurso.status === "aberto"
                            ? "bg-green-100 text-green-600"
                            : concurso.status === "previsto"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {concurso.status === "aberto"
                          ? "Aberto"
                          : concurso.status === "previsto"
                            ? "Previsto"
                            : "Fechado"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition" />
                    </div>
                  </Link>
                </motion.div>
              ))}

              <Link
                href="/admin/concursos"
                className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium mt-4 pt-3 border-t border-gray-200"
              >
                Ver todos os concursos →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Resumo do sistema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all md:col-span-2"
        >
          <h2 className="font-display font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Resumo do sistema
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
              <p className="text-sm text-gray-500 mb-1">Conteúdo por matéria</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.materias > 0
                  ? (stats.catalogo / stats.materias).toFixed(1)
                  : 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">média de conteúdos</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
              <p className="text-sm text-gray-500 mb-1">
                Taxa de usuários ativos
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.usuarios > 0
                  ? ((stats.usuariosAtivos / stats.usuarios) * 100).toFixed(1)
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-400 mt-1">dos cadastrados</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
              <p className="text-sm text-gray-500 mb-1">Concursos abertos</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.concursos > 0
                  ? ((stats.concursosAbertos / stats.concursos) * 100).toFixed(
                      1,
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-400 mt-1">do total</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
              <p className="text-sm text-gray-500 mb-1">
                Exercícios por conteúdo
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.catalogo > 0
                  ? (stats.exercicios / stats.catalogo).toFixed(1)
                  : 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">média</p>
            </div>
          </div>

          {/* Mini estatísticas adicionais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Coffee className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total de acessos</p>
                <p className="text-sm font-bold text-gray-900">2.4k</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Horas estudadas</p>
                <p className="text-sm font-bold text-gray-900">847h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Streak máximo</p>
                <p className="text-sm font-bold text-gray-900">23 dias</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Questões respondidas</p>
                <p className="text-sm font-bold text-gray-900">12.5k</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
